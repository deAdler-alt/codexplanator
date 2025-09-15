# CodeXplanator

**Instant Code Teacher**  
Paste code → Choose level → Get instant explanations, annotations, refactor suggestions, and analysis.  
  
---

## ✨ Features

- 📚 **Multi-level explanations**  
  - Junior: short & simple  
  - Mid: balanced  
  - Senior: deep dive  

- 📝 **Code annotation** (inline comments explaining logic)

- 🔧 **Refactor proposals** (cleaner / more idiomatic code)

- 🧪 **Static analysis**  
  - Potential bugs  
  - Complexity hints  
  - Suggested test cases  

- 📊 **Side-by-side diff view** (original vs refactored)

- 🎨 **Dark/Light mode toggle**

- 📋 **Copy buttons** on every card

- 📄 **One-click export to Markdown** (clean report)

- ✨ **Local Prettier formatting (JS/TS only)**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+  
- npm 9+  

### Setup

```bash
# clone the repo
git clone https://github.com/deAdler-alt/CodeXplanator.git
cd CodeXplanator

# install deps
npm install

# run dev server
npm run dev
````

App will be available at:
👉 [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Tech Stack

* [Next.js 15](https://nextjs.org/) (App Router)
* [React 19](https://react.dev/)
* [TailwindCSS](https://tailwindcss.com/)
* [Monaco Editor](https://microsoft.github.io/monaco-editor/)
* [lucide-react](https://lucide.dev/) for icons
* [Prettier standalone](https://prettier.io/) for local formatting
* Optional: [Ollama](https://ollama.com/) for AI integration (future work 🚧)

---

## 🔮 Future Improvements

* Full AI backend (local Ollama or hosted LLMs)
* Collaborative mode (multi-user sessions)
* More language support for formatting
