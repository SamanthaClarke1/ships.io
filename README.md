# Neutronic

// https://github.com/Samuel-Clarke123/ships.io.git

A simple web game, hosted on nodeJS using Sockets.io.


## TODO / RoadMap

- [x] Ship, sea, base code, actors, etc implemented (proj init)
- [x] Boundaries implemented
- [x] Timestep implemented
- [x] 'Attraction' implemented (like traditional velocity, gets added to the force of an actor in update(), it's a 2dVec)
- [x] 'Attraction' also effects angle
- [x] Possibly even split the actor into two classes: simple actors, and dynamic actors (dynamic actors inherit from simple actors), but have more physics stuff implemented, like boundaries, drag, attraction, collision.
- [x] Collision code implemented for actors (just detecting collision, for now)
- [x] BlackHole can spawn, exist, and be drawn.
- [x] BlackHole can attract Actors
- [x] BlackHole gets activation timer
- [x] BlackHole gets different drawings/colors for activated/deactivated
- [x] Ship spits out actors parented to the ship
- [x] Ship spits out BlackHoles parented to the ship
- [x] <<< play test >>>
- [x] Ship death function implemented (goes invisible (except for death anim) and collision/shooting gets disabled)
- [x] Ship dies on collision with activated BlackHoles
- [x] <<< play test >>>
- [x] Decay code for BlackHoles
- [x] Merge code for BlackHoles
- [x] <<< play test >>>
- [ ] Un-interactable stars get generated for drawing (just on the client side!)
- [ ] Un-interactable stars get better decoration and drawing
- [x] Pulse effects for BlackHoles
- [ ] More particle effects
- [x] Fix up the HTML
- [x] Fix up the game rendering (its just 500x500, static rn)
- [x] <<< play test >>>
- [x] Revise the velocity system
- [x] Add a menu system
- [x] Track player names
- [x] Add support for name selection to the menu system
- [x] Add support for room selection to the menu system
- [x] Start tracking "invisJumps".
- [x] Start displaying "invisJumps".
- [x] Start tracking power presses / actually using invisJumps
- [x] Change how a ship is displayed whilst invis
- [x] Make invis players ignore physics / death
- [x] Award invisJumps to players when they kill other players
- [x] Add a scoreboard to the game
- [ ] Add a display to the scoreboard
- [ ] Revise the menu system
- [ ] Cap name lengths
- [ ] <<< Consider other options for this README, and consider the lasers, and if we want that to be a thing >>>


## Sea

Main refers to either server.js or client.js, they both control the game, only client.js draws.
Server.js consistently receives updates, and sends those updates out to the clients.
Main controls a sea object, which holds the majority of the game.
Sea holds boats, and islands.
Boats hold missiles

Actors, in general, assume a vel and an ang. An update func, and a draw func. An importState, and an exportState

\ ゜o゜)ノ