# Custom Sound Files

Place your custom sound files in this folder:

## Required Files:
- `button-click.mp3` - Sound when clicking the "Pull the Lever" button
- `spinning.mp3` - Sound during slot machine spinning (loops)
- `winner.mp3` - Sound when winner is announced

## Supported Formats:
- MP3 (recommended)
- WAV
- OGG

## Instructions:
1. Add your sound files to this `/public/sounds/` folder
2. Make sure they have the exact names listed above
3. The app will automatically use your custom sounds if they exist
4. If files don't exist, it will fall back to generated sounds

## Tips:
- Keep files small (under 1MB each) for fast loading
- `spinning.mp3` should be a short loop (1-2 seconds)
- `winner.mp3` can be longer celebration sound
- `button-click.mp3` should be very short (under 0.5 seconds)
