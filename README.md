# FTW Exercise 01

This is an exercise for the master course "Fortgeschrittene Themen verteilter, web-basierter Systeme - FTW - WiSe 2024/25".

These are the tasks:

1. Implementieren Sie eine Webanwendung mit einem Framework Ihrer
   Wahl, welche den Browsercache dazu veranlasst Antworten für eine
   Minute zwischenzuspeichern. 
2. Implementieren Sie einen Request der bewusst keine Antworten aus
   Caching-Systemen haben möchte und immer neu generierte Response
   haben will.
3. Wiederholen Sie Übungsaufgabe 1 und 2 mit einem Proxy-Cache Ihrer
   Wahl (Nginx, Apache, Squid, Varnish, Traeffic…)

## How to run

1. Clone the repository
2. Run the following command in the terminal:
    ```bash
    docker-compose up
    ```
3. Open the browser and go to `http://caching.localhost/` to see the caching in action.