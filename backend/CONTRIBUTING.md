# Contributing to Task Management API

Thank you for your interest in contributing to the Task Management API!

## Development Setup

### Prerequisites
- Node.js 14+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-management-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

## Running the Project

### Development Mode with Auto-Reload
```bash
# Level 2 (HTTP Verbs)
npm run dev

# Level 3 (HATEOAS)
npm run level3:dev
```

### Production Mode
```bash
# Level 2
npm start

# Level 3
npm run level3
```

## Testing

### Run API Tests
Use REST Client extension in VS Code:
- Level 2 tests: Open `test.http` and click "Send Request"
- Level 3 tests: Open `test-level3.http` and click "Send Request"

Or use cURL:
```bash
curl http://localhost:5000/api/tasks
```

## Code Style

- Use consistent indentation (2 spaces)
- Follow ES6 conventions
- Add comments for complex logic
- Use descriptive variable names

## Documentation

- Keep README.md and documentation files up to date
- Document API changes in EVALUATION_SUMMARY.md
- Update HATEOAS_Implementation_Guide.md for new links
- Add examples to Response_Examples_L2_vs_L3.md

## Version Tags

- `v1.0-level2` - Level 2 (HTTP Verbs) implementation
- `v2.0-level3` - Level 3 (HATEOAS) implementation

## Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

## Commit Messages

Follow conventional commits:
```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build/dependency changes

Example:
```
feat(api): add pagination support for task list

- Implement page and limit query parameters
- Add _links for prev/next pages
- Update documentation

Closes #123
```

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Update documentation if needed
4. Test thoroughly (run test.http or test-level3.http)
5. Commit with descriptive message
6. Push to your fork
7. Create a Pull Request with description
8. Address any review feedback
9. Merge when approved

## Reporting Issues

When reporting bugs, please include:
- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, Node version, etc.)
- Screenshots if applicable

## Feature Requests

When suggesting features:
- Clear description of the feature
- Use case and benefits
- Example API responses
- How it relates to Richardson Maturity Model

## API Versioning

Current versions:
- **Level 2 (v1.0)**: HTTP Verbs and Status Codes
- **Level 3 (v2.0)**: HATEOAS Implementation

When making breaking changes:
1. Update version in package.json
2. Create a new tag
3. Document changes in CHANGELOG
4. Update all documentation

## Documentation

### Key Documents
- `README.md` - API overview and Level 2 docs
- `Richardson_Maturity_Model_Evaluation.md` - RMM analysis
- `HATEOAS_Implementation_Guide.md` - Level 3 usage guide
- `Response_Examples_L2_vs_L3.md` - Response comparisons
- `QUICKSTART.md` - Setup and testing guide

## Questions?

- Check existing documentation
- Review issue tracker
- Read EVALUATION_SUMMARY.md
- See INDEX_AND_GUIDE.md for navigation

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Happy coding! 🚀**
