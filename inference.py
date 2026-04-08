import os
import json
import time
from typing import Dict, Any

# Mocking OpenEnv client for demonstration of the required structure
class LifeLineEnv:
    def __init__(self, task_name: str):
        self.task_name = task_name
        
    def reset(self) -> Dict[str, Any]:
        print(f"[START] task={self.task_name} env=lifeline-v1 model={os.getenv('MODEL_NAME', 'baseline-agent')}")
        return {"step": 0, "victims": [], "resources": {}}

    def step(self, action: str) -> tuple:
        # In a real scenario, this would call the environment API
        reward = 0.5
        done = False
        obs = {"step": 1, "victims": [], "resources": {}}
        return obs, reward, done, None

def run_baseline():
    """
    Standard OpenEnv baseline implementation.
    Requires:
    - API_BASE_URL
    - MODEL_NAME
    - HF_TOKEN
    """
    api_url = os.getenv("API_BASE_URL")
    model = os.getenv("MODEL_NAME")
    token = os.getenv("HF_TOKEN")

    tasks = ["easy_commuter_accident", "medium_river_flood", "hard_urban_earthquake"]
    
    for task_name in tasks:
        env = LifeLineEnv(task_name)
        obs = env.reset()
        done = False
        step_count = 0
        rewards = []

        while not done and step_count < 20:
            # Hypothetical agent logic: Always dispatch if victims waiting
            action = "dispatch_ambulance" 
            
            obs, reward, done, info = env.step(action)
            step_count += 1
            rewards.append(reward)
            
            print(f"[STEP] step={step_count} action={action} reward={reward:.2f} done={str(done).lower()} error=null")
            
            if step_count >= 20:
                done = True

        success = sum(rewards) > 5.0
        print(f"[END] success={str(success).lower()} steps={step_count} score={sum(rewards):.2f} rewards={','.join([f'{r:.2f}' for r in rewards])}")

if __name__ == "__main__":
    run_baseline()
