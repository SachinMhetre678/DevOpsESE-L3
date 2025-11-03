# 🚀 Task 8: Auto-Scaling Deployment (`k8s-autoscaler-api` Demo)

This repository contains the configuration and instructions for deploying a sample application and configuring a **Horizontal Pod Autoscaler (HPA)** in a Kubernetes cluster. The goal is to demonstrate how Kubernetes automatically scales the number of pods based on the CPU utilization of the running application.

## Prerequisites

  * A running **Kubernetes cluster** (e.g., Minikube, kind, or a cloud-managed cluster).

  * The **`kubectl`** command-line tool, configured to interact with your cluster.

  * The **Metrics Server** must be installed in your cluster. HPA relies on the Metrics Server to gather resource usage data (like CPU and memory).

    > **💡 Check Metrics Server Status:**
    > You can check if the Metrics Server is running by executing:

    > ```bash
    > kubectl get apiservice v1beta1.metrics.k8s.io
    > ```

    > If the output shows `Available: True`, you are ready to proceed.

## Task Steps & Commands

The following steps correspond directly to the task requirements. We will use a conceptual application named `k8s-autoscaler-api` for this demo.

### 1. Deploy the Application with Resource Limits

A Horizontal Pod Autoscaler **requires** the deployment to specify **CPU resource requests**. This is because the HPA scales based on the percentage of the requested CPU.

  * **Repo:** `k8s-autoscale-demo1` (We assume the application manifest is available).
  * **Action:** Deploy the application and specify its **resource limits/requests**.

**`k8s-autoscaler-api-deployment.yaml` (Example)**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: k8s-autoscaler-api
spec:
  replicas: 1 # Start with a single replica
  selector:
    matchLabels:
      app: autoscale-api
  template:
    metadata:
      labels:
        app: autoscale-api
    spec:
      containers:
      - name: api-container
        image: k8s-autoscale-demo1/api:latest # Replace with your actual image
        resources:
          requests:
            cpu: "250m" # REQUEST: 250 milliCPU (25% of one core)
          limits:
            cpu: "500m" # LIMIT: 500 milliCPU (50% of one core)
        ports:
        - containerPort: 8080
```

**Command:**

```bash
# 1. Apply the deployment manifest
kubectl apply -f k8s-autoscaler-api-deployment.yaml

# 2. Verify the deployment
kubectl get pods
```

-----

### 2. Configure the Horizontal Pod Autoscaler (HPA)

Now we configure the scaling policy. The HPA will monitor the average CPU utilization across all current pods.

  * **Configuration:** `min=1`, `max=5`, `cpu=50%`.
      * **Minimum (min=1):** Kubernetes will always ensure at least 1 pod is running.
      * **Maximum (max=5):** The maximum number of pods the HPA can scale up to.
      * **Target CPU (cpu=50%):** If the **average CPU utilization** of the pods exceeds 50% of the requested CPU (`250m`), the HPA will create a new pod.

**Command (Using `kubectl autoscale`):**

```bash
# Target the deployment named 'k8s-autoscaler-api'
kubectl autoscale deployment k8s-autoscaler-api \
  --min=1 \
  --max=5 \
  --cpu-percent=50
```

**Verification:**

```bash
# Check the HPA status (it will show <unknown>/50% initially)
kubectl get hpa
```

<img width="1536" height="1024" alt="pic1" src="https://github.com/user-attachments/assets/db8d58b5-9243-41db-8af8-47d81c443643" />

*Figure 1: Horizontal Pod Autoscaler status showing CPU utilization targets and pod scaling limits*

-----

### 3. Generate Load and Observe Scaling Behavior

The final step is to put the application under stress to trigger the autoscaler.

#### A. Observe Initial State

```bash
# Watch the HPA status and pod count in real-time
kubectl get hpa k8s-autoscaler-api --watch &
kubectl get pods -l app=autoscale-api --watch &
```

<img width="1536" height="1024" alt="pic2" src="https://github.com/user-attachments/assets/10deb12a-5ae9-431c-8f23-6bd2f173fdb5" />


*Figure 2: Multiple pods running as HPA scales the deployment under load*

#### B. Generate CPU Load

We need a separate load generator to repeatedly hit the API and drive the CPU utilization up.

**Command (Using terminal for load generation):**

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/bb5e2c0d-c267-4a63-a5c4-49676a44088b" />

*Figure 3: Generating concurrent requests using curl to simulate CPU load on the application*

**Alternative using a temporary load generator pod:**

```bash
kubectl run -it --rm load-generator --image=alpine/curl -- /bin/sh
# Inside the container, run similar load generation commands
```

  * **Expected Result:** After a short period (typically 30 seconds to 2 minutes), the HPA will report a CPU utilization **above 50%**.

#### C. Observe Scaling (Scale Up)

  * **Watch the HPA:** The `TARGETS` column in `kubectl get hpa` will show a value like `80%/50%`.
  * **Watch the Pods:** New pods will appear and transition from `Pending` → `ContainerCreating` → `Running`. The total pod count will increase (e.g., from 1/5 to 2/5, 3/5, etc.).

#### D. Stop Load and Observe Scaling (Scale Down)

Once the load generator is stopped, the CPU utilization will drop.

  * **Action:** Stop the load generator process.
  * **Expected Result:** After a **cooldown period** (usually a few minutes), the HPA will register a low CPU utilization (e.g., `5%/50%`). It will then start terminating excess pods until the count reaches the minimum of **1**.

-----

## ✅ Output Confirmation

If all steps were successful, the output you'll observe is:

> **Pods scale automatically under load:**
>
> 1.  When CPU load is high, the number of pods scales up to a maximum of 5.
> 2.  When CPU load is removed, the number of pods scales down back to the minimum of 1.

## 📊 Demonstration Evidence

The provided screenshots demonstrate:
- **Figure 1**: HPA monitoring CPU utilization and adjusting pod counts dynamically
- **Figure 2**: Multiple application pods running concurrently during high load periods  
- **Figure 3**: Load generation process creating concurrent requests to trigger autoscaling

This completes the autoscaling demonstration showing both **scale-up** and **scale-down** capabilities of Kubernetes Horizontal Pod Autoscaler.
