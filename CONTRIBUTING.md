# Contributing to Wait, is this just A Dark Room?

Thanks for your interest in contributing! This project is still in development and could use help in various areas.

## How to Contribute

### 🐛 Bug Reports
- Check if the bug has already been reported in [Issues](https://github.com/paral-lax/Wait-is-this-just-a-dark-room/issues)
- Create a new issue with:
  - Clear description of the problem
  - Steps to reproduce
  - Browser/device information
  - Screenshots if applicable

### 💡 Feature Suggestions
- Open an issue with the `enhancement` label
- Describe the feature and why it would improve the game
- Keep in mind this is meant to be a simple, browser-based game

### 🔧 Code Contributions

#### Easy Contributions
- **Random Events**: Add new events to `events.js` - follow the existing format
- **Text Variations**: Add more message variations for actions and events
- **Balance Tweaks**: Adjust resource costs, drop rates, or cooldowns
- **Bug Fixes**: Fix obvious issues or typos

#### Bigger Contributions
- New game mechanics or systems
- UI/UX improvements
- Mobile optimization
- Performance improvements

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/Wait-is-this-just-a-dark-room.git`
3. Create a branch: `git checkout -b your-feature-name`
4. Make your changes
5. Test in a browser (just open `index.html`)
6. Commit and push
7. Create a Pull Request

## Code Guidelines

### File Structure
- `index.html` - Main HTML structure
- `main.js` - Core game logic
- `events.js` - Random events and event handling
- `files/stylesheets/styles.css` - All styling

### JavaScript Style
- Use ES6+ features
- Keep functions focused and readable
- Add comments for complex logic
- Follow existing naming conventions

### Adding Random Events
Events go in `events.js` following this structure:

```javascript
{
  id: 'unique_event_id',
  title: 'Event Title',
  text: 'Event description text.',
  actions: [
    { text: 'action option', result: 'result_handler_name' },
    { text: 'costly option', result: 'other_result', cost: { food: 5 } }
  ],
  chance: 0.1, // 10% chance when triggered
  condition: () => this.state.day > 5 // when this event can occur
}
```

Then add the result handler in the `handleEventResult()` function.

## Things to Avoid

- Don't break the minimalist aesthetic
- Avoid adding complex dependencies
- Don't make the game too easy or too hard
- Keep file sizes small (it's a simple web game)
- Don't add features that require a server

## Testing

- Test in multiple browsers (Chrome, Firefox, Safari)
- Check mobile responsiveness
- Verify save/load functionality works
- Make sure new events trigger properly
- Test edge cases with resource management

## Questions?

Open an issue or reach out if you're unsure about anything. I'm pretty responsive and happy to help new contributors.

## Recognition

Contributors will be mentioned in the game's credits screen. Thanks for helping make this project better!
