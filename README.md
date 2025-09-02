# 🎲 Lucky Draw - Random Name Picker

A modern, feature-rich Lucky Draw web application built with Next.js. Perfect for giveaways, contests, team selections, and any scenario where you need to randomly select from a list of participants.

![Lucky Draw Screenshot](https://via.placeholder.com/800x400/0a0a0a/DC2626?text=Lucky+Draw+App)

## ✨ Features

### 🎨 **Modern Dark Theme Design**
- Dark gradient background with subtle red highlights
- Glassmorphism effects with blur and transparency
- Smooth rounded corners and elegant shadows
- Red accent colors (#DC2626, #EF4444, #B91C1C)

### 📝 **Smart Name Input System**
- Multiple input methods: one per line or comma-separated
- Add/remove individual names with smooth animations
- Clear all names with one click
- Real-time participant counter
- Input validation and trimming

### 🎯 **Engaging Drawing Mechanism**
- Large, prominent "Start Draw" button
- 2-3 second spinning animation with name cycling
- Gradual slowdown effect (ease-out animation)
- Random winner selection with fair distribution

### 🎬 **Rich Animations & Effects**
- **Spinning Animation**: Names rapidly cycle during draw
- **Confetti Explosion**: Multi-burst confetti when winner is revealed
- **Glow Effects**: Dynamic button and UI element glows
- **Smooth Transitions**: Fade-in/fade-out effects throughout
- **Particle Effects**: Sparkling animations around winner display

### 🔊 **Immersive Audio System**
- **Spinning Sound**: Roulette-like sound during name cycling
- **Winner Sound**: Celebratory chime when winner is revealed
- **Button Sounds**: Subtle click feedback for interactions
- **Mute/Unmute Toggle**: Full audio control
- **Web Audio API**: Generated sounds, no external files needed

### 📱 **Fully Responsive Design**
- Mobile-first approach with touch-friendly interface
- Tablet and desktop optimizations
- Adaptive text sizes and spacing
- Optimized glassmorphism effects for mobile
- Custom scrollbars and smooth scrolling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bobo-lucky-draw
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Built With

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[Canvas Confetti](https://github.com/catdad/canvas-confetti)** - Confetti effects
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

## 🎮 How to Use

1. **Add Participants**
   - Type names in the text area (one per line or comma-separated)
   - Click "Add Names" or press Ctrl+Enter
   - Remove individual names with the X button
   - Use "Clear All" to start over

2. **Start the Draw**
   - Click the "Start Draw" button
   - Watch names spin for 2-3 seconds
   - Enjoy the confetti celebration when winner is revealed

3. **Audio Controls**
   - Toggle sound on/off with the volume button
   - Sounds include spinning effects and winner celebration

## 🎯 Use Cases

- **Giveaways & Contests**: Fair random selection for prizes
- **Team Building**: Random team assignments or partner selection
- **Classroom Activities**: Student selection for presentations or activities
- **Event Management**: Random door prize drawings
- **Decision Making**: When you can't decide between options

## 📱 Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Customization

The app is built with customization in mind:

- **Colors**: Modify CSS variables in `globals.css`
- **Animations**: Adjust Framer Motion settings in `LuckyDraw.tsx`
- **Sounds**: Customize Web Audio API parameters
- **Layout**: Responsive design with Tailwind classes

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Enjoy your Lucky Draw experience!** 🍀
