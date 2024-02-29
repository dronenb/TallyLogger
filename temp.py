import sys
import keyboard

while True:
    print('waiting')
    keyboard.on_press_key("p", lambda _:print("You pressed p"))
    print('still waiting...')
