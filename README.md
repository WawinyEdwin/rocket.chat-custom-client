# A Custom Rocket.Chat Client.
This Client App leverage the use of Rocket.chat Realtime API(s) and Websocket to emulate a custom client communication with the Rocket.Chat Server.
![The web client in action](https://i.postimg.cc/dtZPKbjP/Screenshot-from-2023-05-29-14-07-15.png)
## SetUp.
- Server Setup

To try this locally you will need;
1. Docker; installed on your PC
2. Node
3. Npm
4. Web Browser (Chrome, Firefox, Edge etc.)

navigate to a folder of your choice, and fetch the example rocket.chat compose file by running the following command on your terminal
```
curl -L https://raw.githubusercontent.com/RocketChat/Docker.Official.Image/master/compose.yml -O
```
Build and spin up the Container images described in the compose files, by running
```
docker compose -d up
```
This will pull the necessary images, build and start the containers running, you will have two containers, a mongodb and a rocketchat server containers. The output on the terminal may look like this.
```
[+] Building 0.0s (0/0)                                                         
[+] Running 3/3
 ✔ Network rc_default         Created                                      0.1s 
 ✔ Container rc-mongodb-1     Started                                      0.9s 
 ✔ Container rc-rocketchat-1  Started                                      1.2s 
```
At this point, the rocket.chat server is accessible at `http://localhost:3000`, and you can begin making requests to the server via any API client.

- Web Client Setup

Clone this repository from [here]()

Navigate to the repository directory and Install the required dependencies by doing a quick
```
npm install
```

Create an `.env` file at the root of your folder, check the `.env.example` included.

Add the server url (`ws://localhost:3000/websocket`) to your enviromental variable.

Head over and create a two users on the rocket.chat client running at `http://localhost:3000` and make sure they can login successfully. Note the username of the second user. Keep the other logged in.

Replace the `address` variable in pages/chat/index.jsx with the username of this second user

Using an API client such as Postman, Insomnia, etc. :

- Login the noted user via this endpoint `http://localhost:3000/api/v1/login` more details [here](https://developer.rocket.chat/reference/api/rest-api/endpoints/other-important-endpoints/authentication-endpoints/login) to get their user id from the response with the field `userId`, copy its value and replace in variable field `userId` in pages/chat/index.jsx

- Use this endpoint to create an direct message chat between the two users `http://localhost:3000/api/v1/im.create` more details [here](https://developer.rocket.chat/reference/api/rest-api/endpoints/core-endpoints/im-endpoints/create) if success you will get a room id in the response with field `rid`, copy that and replace in variable field `roomId` in pages/chat/index.jsx 


Start the application by running
```
npm run dev
```

Head over to the url where the client is running at `http://localhost:3001` preferably or any other point as indicated from the logs.


Play around with the custom client running, you can keep the rocket.chat client interface open to act as another user.. to see more magic open the developer tools, open the network tab, filter the request by `WS`- websockets and see the realtime data exchange.

Find more endpoints and developer documentation [Rocket.Chat](https://developer.rocket.chat/)

Happy Hacking :)


