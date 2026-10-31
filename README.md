# Advanced Web Development Frameworks (ITUE301) - Lab Portfolio

**Student:** Kaushal Patel  
**Institution:** Faculty of Technology and Engineering, Charotar University of Science and Technology (CHARUSAT)  
**Department:** Information Technology / Computer Engineering / CSE / AIML  

---

## 📑 Table of Contents
1. [Overview](#-overview)
2. [Practical 2: State Management and Routing in React](#-practical-2-state-management-and-routing-in-react)
3. [Practical 3: API Integration and Data Rendering in React](#-practical-3-api-integration-and-data-rendering-in-react)
4. [Conceptual Analysis & Viva Questions](#-conceptual-analysis--viva-questions)
5. [Setup & Running Locally](#-setup--running-locally)

---

## 🌟 Overview
This repository contains the progressive laboratory implementations for the **Advanced Web Development Frameworks** course. It features a modern, responsive Single Page Application (SPA) built using **React 19**, **Vite**, and **React Router v7**, with client-side state management and asynchronous REST API integration.

---

## 🗺️ Practical 2: State Management and Routing in React

### Objective
To implement reactive state management using `useState` and multi-page client-side navigation using React Router without full page reloads.

### Routes Implemented
| Path | Component | Description |
|---|---|---|
| `/` | `Home.jsx` | Landing page featuring Header, About Me, and Skills showcase |
| `/projects` | `Projects.jsx` | Dynamic project showcase fetching repositories via GitHub REST API |
| `/contact` | `Contact.jsx` | Interactive contact form with real-time input capture and character counter |
| `*` | `NotFound.jsx` | Custom 404 error page for undefined routes with return navigation |

### State Management Features
- **Controlled Form Inputs (`Contact.jsx`):** State managed via `formData` (`name`, `email`, `message`), updating on each keystroke and displayed in real-time.
- **Live Character Counter:** Dynamic character count (`{formData.message.length} / 500`) with visual threshold cues.
- **Help Tooltip Toggle:** `showHelpTooltip` state to toggle form instructions on and off.
- **Dark/Light Mode:** `isDarkMode` state that applies `.dark-theme` to the root element.

---

## 🌐 Practical 3: API Integration and Data Rendering in React

### Objective
To consume a public REST API in React and handle asynchronous data with loading, success, and error states.

### Architecture & Data Flow
```
Projects.jsx
├── useEffect() → triggers fetch on component mount
├── useState: repositories, loading, error, searchTerm
├── [loading]  → <LoadingSpinner />
├── [error]    → <ErrorMessage message={error} onRetry={fetchRepositories} />
└── [success]  → Filtered Repository Cards
                  ├── Repository Name + ⭐ Stargazers Count
                  ├── Language Badge & Description
                  └── Direct Source URL
```

### Key Technical Implementations
1. **Public REST API Consumed:**
   - **Endpoint:** `https://api.github.com/users/octocat/repos?sort=updated&per_page=9`
   - **Method:** `GET` with `Accept: application/vnd.github+json`
2. **Three Core Asynchronous States:**
   - `repositories`: Holds fetched repository data objects.
   - `loading`: Boolean state indicating active network request; displays animated `<LoadingSpinner />`.
   - `error`: Stores API error message if the network request or HTTP status fails; displays `<ErrorMessage />`.
3. **Supplementary Problems Implemented:**
   - **Retry Button:** Added an intuitive `🔄 Retry Request` action in `ErrorMessage` and on the page header to re-trigger the fetch without reloading the page.
   - **Search / Filter Input:** Real-time filter input that searches repositories dynamically by name.
   - **Star Count Display:** Displays each repository's GitHub star count (`⭐ {repository.stargazers_count}`) alongside the repository name.
   - **Interactive Error Simulation:** Includes a `⚡ Simulate API Error` button allowing faculty and testers to verify the error boundary and retry mechanism deliberately.

---

## 🧠 Conceptual Analysis & Viva Questions

### 1. Why is `useEffect` required to trigger a fetch on component mount instead of calling `fetch` directly in the component body?
Calling `fetch` directly inside the component body executes the network request during every single render. Since updating state inside the fetch callback (`setRepositories`, `setLoading`) triggers a re-render, this results in an **infinite re-render loop**, exhausting API rate limits and freezing the browser.  
`useEffect` with an empty dependency array (`[]`) tells React to run the side effect **only once after the component has mounted**, isolating side effects from pure render logic.

### 2. What is the difference between a loading state and an error state, and why must both be handled separately?
- **Loading State:** The request is in flight. The UI should communicate that work is in progress (e.g. `<LoadingSpinner />`) to prevent the user from thinking the application has frozen.
- **Error State:** The request has terminated abnormally (e.g., 404 Not Found, 403 Rate Limit, or network disconnection). The UI must communicate why the operation failed and offer recovery paths (e.g., a **Retry button**).
Handling both separately is vital for robust error boundaries and predictable state transitions.

### 3. How would the user experience change if loading and error states were not implemented?
Without a **loading state**, users would see a jarring blank screen or broken UI elements while waiting for network responses.  
Without an **error state**, API failures would silently fail, leave the application permanently stuck on a blank screen or spinner, or cause unhandled JavaScript exceptions that crash the entire app.

---

## 🛠️ Setup & Running Locally

### 1. Clone & Install
```bash
git clone https://github.com/kaushal-it-345/Portfolio-.git
cd Portfolio-
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### 3. Build for Production
```bash
npm run build
```
The production bundle will be created in the `dist/` directory.
