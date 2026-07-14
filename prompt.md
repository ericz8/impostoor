Your task is to create a mobile-focused web-based version of the game Imposter, which is to be called Impostoor. Here are the requirements:

Application + interface:
1. upon app launch, users get a basic explanation (first timers) or go straight to the new game screen (not first time).
2. in the new game screen/config screen, users: select a category (at least one), toggle hints on/off and then add players. This creates what is known as a session (specific to this tab/window instance). Players from recent sessions should be saved and be able to be added in the new game window with a 1 tap button.
3. when the game starts: a random word is selected from the category, avoiding words already used in the session if possible. then, an imposter is selected, and the game goes through the starting phase
4. starting phase: the device is passed around and each player clicks their name and it is revealed to them whether or not they are an imposter. here, if the player is not an imposter, they will be given the random word selected in step 3. in the case that the player is an imposter, they will be told that they are the imposter, and the game will provide a hint (if hints are toggled on).
5. play phase: after everyone has viewed their information, it jumps to a screen that shows who starts (randomly selected from the player list) and the direction of play (counter clockwise or clockwise). Include a play again button which goes back to the new game screen. also provide information on win conditions (if the imposter is voted out, then they can still win if they guess the word correctly, the imposter also wins if they are not voted out)
6. Across the session: keep settings and players (allow for adding/deleting players in the new game screen).

Technical requirements:
1. fully pwa compatible with install button + basic instructions for install on iphone + proper caching for offline play. the app should feel native.
2. use modern svelte 5 and web syntax 
