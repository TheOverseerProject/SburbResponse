### Let's make the Sburb engine playable on touch devices!

This is mainly for a personal project, but here are the tasks if anyone would like to chip in:

- [x] Add touch controls. Map "press" events to key strokes, map "tap" events to spacebar and mouse.
- [x] Increase aspect ratio and make the whole game scalable (former first, then let's try the latter)
- [x] Replace Chooser class with Big Friendly Buttons which are accessible on mobile browsers
- [x] Side note: I will be removing the Chooser class almost entirely, as most items/characters will only have one action apiece in my project. I'll be defaulting it to the first action. Big Friendly Buttons will only appear at critical decision making moments.
- [ ] Create a workaround for the URL bar inevitably coming down and obscuring the canvas whenever someone swipes on a phone.
  * Full screening the game only works on non-Safari browsers, and even THEN w3c standards frowns upon it if it's not a direct onClick event.
- [x] Remove Flash support, add mp4 
- [ ] ...and webm
- [x] Figure out how to initiate "autoplay" with a hidden user generated trigger, for mobile
