# Contributing to react-form-shield

Thank you for your interest in contributing to react-form-shield! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

If you find a bug in the project, please create an issue on GitHub with the following information:

- A clear, descriptive title
- A detailed description of the issue
- Steps to reproduce the problem
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment information (browser, OS, etc.)

### Suggesting Enhancements

If you have an idea for an enhancement, please create an issue on GitHub with the following information:

- A clear, descriptive title
- A detailed description of the enhancement
- Any relevant examples or mockups
- Why this enhancement would be useful to most users

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Run tests to ensure your changes don't break existing functionality
5. Submit a pull request

#### Pull Request Guidelines

- Follow the existing code style
- Include tests for new features or bug fixes
- Update documentation as needed
- Keep pull requests focused on a single topic
- Reference any related issues in your pull request description

## Development Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Run tests with `npm test`
4. Start the development server with `npm run storybook`

## Project Structure

```
react-form-shield/
├── src/
│   ├── client/           # Client-side implementation
│   │   ├── components/   # UI components
│   │   ├── hooks/        # React hooks
│   │   ├── constants.ts  # Configuration constants
│   │   ├── types.ts      # TypeScript type definitions
│   │   ├── utils.ts      # Utility functions
│   │   └── index.ts      # Client exports
│   ├── server/           # Server-side implementation
│   │   ├── middleware/   # Server middleware
│   │   ├── types.ts      # Server-side type definitions
│   │   ├── validators.ts # Server-side validators
│   │   └── index.ts      # Server exports
│   └── index.ts          # Main package entry point
├── examples/             # Example implementations
├── docs/                 # Documentation
├── tests/                # Test files
└── scripts/              # Build and utility scripts
```

## Coding Standards

- Use TypeScript for all new code
- Follow the existing code style
- Write JSDoc comments for all functions, classes, and interfaces
- Use meaningful variable and function names
- Keep functions small and focused on a single task
- Write tests for all new functionality

## Testing

- Run tests with `npm test`
- Ensure all tests pass before submitting a pull request
- Add tests for new features or bug fixes

## Documentation

- Update documentation as needed
- Use JSDoc comments for all functions, classes, and interfaces
- Keep documentation up-to-date with code changes

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [GPL-3.0 License](LICENSE).
