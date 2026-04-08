# **App Name**: LifeLine AI: Intelligent Disaster Response Environment

## Core Features:

- Scenario Creator & Editor: User interface to define and edit various disaster scenarios (victims, severity, resources, geographical context) which are then used to initialize the OpenEnv simulation.
- AI Scenario Generator: An AI tool that leverages a large language model to generate diverse and detailed disaster scenario configurations (e.g., type, scale, specific challenges) based on high-level user prompts.
- Real-time Environment Visualizer: A dynamic dashboard displaying the OpenEnv environment's current state, including victim status, resource locations, estimated response times, and event logs.
- Simulation Control & Interaction: Provides controls to start, pause, reset, and step through episodes, as well as an interface for dispatching manual actions for human-in-the-loop testing or observation.
- Performance Analytics Dashboard: Visualizes the agent's reward signals over time, cumulative scores for tasks (Easy, Medium, Hard), and comparisons against baseline inference script results.
- AI Decision Explainer: An AI tool that interprets the agent's actions given the current observation from the environment and provides human-readable explanations or justifications for its decisions, aiding in model debugging and understanding.
- Historical Simulation Data Storage: Stores logs, environment states, agent actions, and task scores from past simulation runs for review and performance tracking.

## Style Guidelines:

- Primary color: A vibrant, yet refined blue (#638FE9) to signify intelligence, reliability, and precision, contrasting with the dark background.
- Background color: A deep, subtly bluish-grey (#1A1D23) providing a sophisticated and focused dark theme suitable for monitoring dashboards, ensuring high readability.
- Accent color: A striking violet-blue (#765EDD), analogous to the primary but distinctly brighter, to highlight interactive elements, calls to action, and important data points without being distracting.
- Body and headline font: 'Inter', a grotesque-style sans-serif, chosen for its modern, neutral, and highly legible characteristics, ideal for presenting dense information and ensuring clarity.
- Code font: 'Source Code Pro', a monospaced sans-serif, to ensure optimal readability for structured logs and code snippets (e.g., from inference.py).
- Clean, linear, and universally recognizable icons that complement the dark, modern interface. Emphasize symbols related to emergency response, data visualization, and user controls (e.g., alert signals, maps, play/pause buttons, analytics charts).
- A dashboard-centric, modular layout that allows for simultaneous display of various data streams and control panels, optimizing information density while maintaining an intuitive hierarchy. Emphasize responsiveness for different screen sizes.
- Subtle, non-distracting animations for real-time data updates, status changes, and transitions between different monitoring views. Use smooth fades and minimal motion to enhance the user experience without overwhelming it.