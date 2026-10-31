# Practical 2: State Management and Routing in React

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Institution:** Faculty of Technology and Engineering, Charotar University of Science and Technology (CHARUSAT)  
**Department:** Information Technology / Computer Engineering / CSE / AIML  

---

## 🎯 Objective
To implement reactive state management using `useState` and multi-page client-side navigation using React Router v6+ in the student portfolio application.

---

## 🏗️ Architecture & Component Hierarchy

```
main.jsx (wrapped in <BrowserRouter>)
└── App.jsx
    ├── Navigation.jsx (theme toggle + routes via <Link>)
    ├── <main>
    │   ├── Route: "/"         → Home.jsx (Header, About, Skills)
    │   ├── Route: "/projects" → Projects.jsx (GitHub API integration)
    │   ├── Route: "/contact"  → Contact.jsx (controlled inputs, live preview, help tooltip)
    │   └── Route: "*"         → NotFound.jsx (404 custom error page)
    └── Footer.jsx
```

---

## 🗺️ Routes Implemented

| Path | Component | Description |
|---|---|---|
| `/` | `Home.jsx` | Landing page featuring Header, About Me, and Skills showcase |
| `/projects` | `Projects.jsx` | Dynamic project showcase fetching repositories via GitHub REST API |
| `/contact` | `Contact.jsx` | Interactive contact form with real-time input capture and character counter |
| `*` | `NotFound.jsx` | Custom 404 error page for undefined / invalid routes with return navigation |

---

## ⚡ State Management (`useState`) Breakdown

1. **Controlled Form Inputs (`Contact.jsx`):**
   - Managed via `formData` state (`name`, `email`, `message`).
   - Every keystroke triggers `handleInputChange`, keeping React state and DOM values synchronized.
   - Captures and displays user input in **real-time** directly below each input and in a dedicated live preview container.

2. **UI Visibility Toggle (`Contact.jsx`):**
   - `showHelpTooltip`: Toggles a helpful form guidance and guidelines box on user click.
   - `showSuccessMessage`: Temporarily renders a confirmation banner upon form submission.

3. **Live Character Counter (`Contact.jsx`):**
   - Displays real-time character count (`{formData.message.length} / 500 characters`) updating dynamically as the user types.

4. **Dark/Light Mode Theme Toggle (`App.jsx` & `Navigation.jsx`):**
   - Managed using `isDarkMode` state.
   - Applies the `.dark-theme` CSS class to the root element (`html` / `body`), dynamically adjusting CSS variables for dark and light modes.

---

## 🧠 Key Questions & Conceptual Analysis

### 1. What is the role of each component in the overall UI structure?
- **`main.jsx`**: Application entry point; initializes React root and provides `<BrowserRouter>` context to ensure client-side routing is universally available without prop drilling.
- **`App.jsx`**: Root container defining the routing table (`<Routes>`, `<Route>`) and global states (theme toggle).
- **`Navigation.jsx`**: Persistent navigation bar utilizing `<Link>` components to navigate without browser refresh, preventing loss of client state.
- **`Home.jsx`, `Projects.jsx`, `Contact.jsx`**: Distinct page-level views loaded dynamically according to the URL path.
- **`NotFound.jsx`**: Graceful fallback component that catches invalid routes.
- **`Footer.jsx`**: Consistent reusable footer displaying contact email and copyright info.

### 2. How does React re-render when props change?
React uses a virtual DOM diffing algorithm (Reconciliation). When a component's props change:
1. React re-evaluates the component function with new props.
2. It generates a new Virtual DOM representation and compares it against the previous Virtual DOM snapshot.
3. Only the specific DOM nodes that have changed are updated in the actual browser DOM, ensuring high performance.

### 3. Why is component reusability important in large-scale applications?
- **Maintainability**: Changes or bug fixes made in one component instantly apply everywhere it is used.
- **Consistency**: Guarantees visual and functional consistency across pages and design systems.
- **Testability**: Independent components can be easily unit-tested in isolation.
- **Productivity**: Accelerates development by allowing engineers to compose complex interfaces from existing, tested building blocks.

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🧪 Testing Checklist
- [x] Client-side navigation across `/`, `/projects`, and `/contact` without full page reloads.
- [x] Controlled inputs reflecting changes in real-time.
- [x] Live character counter below message input.
- [x] Help tooltip toggle button displaying/hiding form tips.
- [x] Dark/Light mode toggle button applying `.dark-theme` to the root element.
- [x] 404 page rendered when navigating to any unknown URL (e.g. `/unknown`).
