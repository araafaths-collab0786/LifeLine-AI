# LifeLine AI 🚑

**Smart AI for Real-World Emergency Response**

LifeLine AI is an OpenEnv-based simulation environment where AI agents learn to make critical decisions during disaster situations. The goal is simple but powerful — use limited resources wisely to save as many lives as possible.

---

## 🧠 Why LifeLine AI?

In real emergencies, every second counts. Decisions must be fast, accurate, and efficient. This project simulates those high-pressure scenarios, allowing AI agents to learn:

- How to prioritize victims  
- How to manage limited resources  
- How to make better decisions under constraints  

---

## ⚙️ How It Works

The environment follows a step-based interaction model:

### 🔹 State (Observation)
- Number of victims  
- Available rescue resources  
- Current step count  

---

### 🔹 Actions
- `dispatch` → Send help to victims  
- `wait` → Delay action (not recommended)  

---

### 🔹 Rewards
- +1.0 → All victims saved  
- +0.5 → Effective action  
- -0.1 → Delay  
- -0.2 → Invalid or wasted action  

The reward system guides the agent towards optimal decision-making.

---

## 🔄 API Endpoints

### ▶️ Reset Environment
`GET /reset`

Starts a new scenario and returns the initial state.

---

### ▶️ Take Action
`POST /step`

#### Request:
```json
{
  "action": "dispatch"
}
