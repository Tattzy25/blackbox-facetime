Home
Gemini API
Docs
Gemini Live API overview




The Live API enables low-latency, real-time voice and vision interactions with Gemini. It processes continuous streams of audio, images, and text to deliver immediate, human-like spoken responses, creating a natural conversational experience for your users.

Live API Overview

Try the Live API in Google AI Studiomic
Clone example apps from GitHubcode
Use coding agent skillsterminal
Use cases
Live API can be used to build real-time voice agents for a variety of industries, including:

E-commerce and retail: Shopping assistants that offer personalized recommendations and support agents that resolve customer issues.
Gaming: Interactive non-player characters (NPCs), in-game help assistants, and real-time translation of in-game content.
Next-gen interfaces: Voice- and video-enabled experiences in robotics, smart glasses, and vehicles.
Healthcare: Health companions for patient support and education.
Financial services: AI advisors for wealth management and investment guidance.
Education: AI mentors and learner companions that provide personalized instruction and feedback.
Key features
Live API offers a comprehensive set of features for building robust voice agents:

Multilingual support: Converse in 70 supported languages.
Barge-in: Users can interrupt the model at any time for responsive interactions.
Tool use: Integrates tools like function calling and Google Search for dynamic interactions.
Audio transcriptions: Provides text transcripts of both user input and model output.
Proactive audio: Lets you control when the model responds and in what contexts.
Affective dialog: Adapts response style and tone to match the user's input expression.
Technical specifications
The following table outlines the technical specifications for the Live API:

Category	Details
Input modalities	Audio (raw 16-bit PCM audio, 16kHz, little-endian), images (JPEG <= 1FPS), text
Output modalities	Audio (raw 16-bit PCM audio, 24kHz, little-endian)
Protocol	Stateful WebSocket connection (WSS)
Choose an implementation approach
When integrating with Live API, you'll need to choose one of the following implementation approaches:

Server-to-server: Your backend connects to the Live API using WebSockets. Typically, your client sends stream data (audio, video, text) to your server, which then forwards it to the Live API.
Client-to-server: Your frontend code connects directly to the Live API using WebSockets to stream data, bypassing your backend.
Note: Client-to-server generally offers better performance for streaming audio and video, since it bypasses the need to send the stream to your backend first. It's also easier to set up since you don't need to implement a proxy that sends data from your client to your server and then your server to the API. However, for production environments, in order to mitigate security risks, we recommend using ephemeral tokens instead of standard API keys.

Get started with Gemini Live API using the Google GenAI SDK



The Gemini Live API allows for real-time, bidirectional interaction with Gemini models, supporting audio, video, and text inputs and native audio outputs. This guide explains how to integrate with the API using the Google GenAI SDK on your server.

Try the Live API in Google AI Studiomic Clone the example app from GitHubcode Use coding agent skillsterminal
Overview
The Gemini Live API uses WebSockets for real-time communication. The google-genai SDK provides a high-level asynchronous interface for managing these connections.

Key concepts:

Session: A persistent connection to the model.
Config: Setting up modalities (audio/text), voice, and system instructions.
Real-time Input: Sending audio and video frames as blobs.
Connecting to the Live API
Start a Live API session with an API key:

Python
JavaScript

import asyncio
from google import genai

client = genai.Client(api_key="YOUR_API_KEY")

model = "gemini-3.1-flash-live-preview"
config = {"response_modalities": ["AUDIO"]}

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        print("Session started")
        # Send content...

if __name__ == "__main__":
    asyncio.run(main())
Sending text
Text can be sent using send_realtime_input (Python) or sendRealtimeInput (JavaScript).

Python
JavaScript

await session.send_realtime_input(text="Hello, how are you?")
Sending audio
Audio needs to be sent as raw PCM data (raw 16-bit PCM audio, 16kHz, little-endian).

Python
JavaScript

# Assuming 'chunk' is your raw PCM audio bytes
await session.send_realtime_input(
    audio=types.Blob(
        data=chunk,
        mime_type="audio/pcm;rate=16000"
    )
)
For an example of how to get the audio from the client device (e.g. the browser) see the end-to-end example on GitHub.

Sending video
Video frames are sent as individual images (e.g., JPEG or PNG) at a specific frame rate (max 1 frame per second).

Python
JavaScript

# Assuming 'frame' is your JPEG-encoded image bytes
await session.send_realtime_input(
    video=types.Blob(
        data=frame,
        mime_type="image/jpeg"
    )
)
For an example of how to get the video from the client device (e.g. the browser) see the end-to-end example on GitHub.

Receiving audio
The model's audio responses are received as chunks of data.

Python
JavaScript

async for response in session.receive():
    if response.server_content and response.server_content.model_turn:
        for part in response.server_content.model_turn.parts:
            if part.inline_data:
                audio_data = part.inline_data.data
                # Process or play the audio data
See the example app on GitHub to learn how to receive the audio on your server and play it in the browser.

Receiving text
Transcriptions for both user input and model output are available in the server content.

Python
JavaScript

async for response in session.receive():
    content = response.server_content
    if content:
        if content.input_transcription:
            print(f"User: {content.input_transcription.text}")
        if content.output_transcription:
            print(f"Gemini: {content.output_transcription.text}")
Handling tool calls
The API supports tool calling (function calling). When the model requests a tool call, you must execute the function and send the response back.

Python
JavaScript

async for response in session.receive():
    if response.tool_call:
        function_responses = []
        for fc in response.tool_call.function_calls:
            # 1. Execute the function locally
            result = my_tool_function(**fc.args)

            # 2. Prepare the response
            function_responses.append(types.FunctionResponse(
                name=fc.name,
                id=fc.id,
                response={"result": result}
            ))

        # 3. Send the tool response back to the session
        await session.send_tool_response(function_responses=function_responses)
What's next
Read the full Live API Capabilities guide for key capabilities and configurations; including Voice Activity Detection and native audio features.
Read the Tool use guide to learn how to integrate Live API with tools and function calling.
Read the Session management guide for managing long running conversations.
Read the Ephemeral tokens guide for secure authentication in client-to-server applications.
For more information about the underlying WebSockets API, see the WebSockets API reference.

Get started with Gemini Live API using WebSockets



The Gemini Live API allows for real-time, bidirectional interaction with Gemini models, supporting audio, video, and text inputs and native audio outputs. This guide explains how to integrate directly with the API using raw WebSockets.

Try the Live API in Google AI Studiomic Clone the example app from GitHubcode Use coding agent skillsterminal
Overview
The Gemini Live API uses WebSockets for real-time communication. Unlike using an SDK, this approach involves directly managing the WebSocket connection and sending/receiving messages in a specific JSON format defined by the API.

Key concepts:

WebSocket Endpoint: The specific URL to connect to.
Message Format: All communication is done via JSON messages conforming to BidiGenerateContentClientMessage and BidiGenerateContentServerMessage structures.
Session Management: You are responsible for maintaining the WebSocket connection.
Authentication
Authentication is handled by including your API key as a query parameter in the WebSocket URL.

The endpoint format is:


wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=YOUR_API_KEY
Replace YOUR_API_KEY with your actual API key.

Authentication with Ephemeral Tokens
If you are using ephemeral tokens, you need to connect to the v1alpha endpoint. The ephemeral token needs to be passed as an access_token query parameter.

The endpoint format for ephemeral keys is:


wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token={short-lived-token}
Replace {short-lived-token} with the actual ephemeral token.

Connecting to the Live API
To start a live session, establish a WebSocket connection to the authenticated endpoint. The first message sent over the WebSocket must be a BidiGenerateContentSetup containing the config. For the full configuration options, see the Live API - WebSockets API reference.

Python
JavaScript

import asyncio
import websockets
import json

API_KEY = "YOUR_API_KEY"
MODEL_NAME = "gemini-3.1-flash-live-preview"
WS_URL = f"wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key={API_KEY}"

async def connect_and_configure():
    async with websockets.connect(WS_URL) as websocket:
        print("WebSocket Connected")

        # 1. Send the initial configuration
        config_message = {
            "config": {
                "model": f"models/{MODEL_NAME}",
                "responseModalities": ["AUDIO"],
                "systemInstruction": {
                    "parts": [{"text": "You are a helpful assistant."}]
                }
            }
        }
        await websocket.send(json.dumps(config_message))
        print("Configuration sent")

        # Keep the session alive for further interactions
        await asyncio.sleep(3600) # Example: keep open for an hour

async def main():
    await connect_and_configure()

if __name__ == "__main__":
    asyncio.run(main())
Sending text
To send text input, construct a BidiGenerateContentRealtimeInput message with the text field.

Python
JavaScript

# Inside the websocket context
async def send_text(websocket, text):
    text_message = {
        "realtimeInput": {
            "text": text
        }
    }
    await websocket.send(json.dumps(text_message))
    print(f"Sent text: {text}")

# Example usage: await send_text(websocket, "Hello, how are you?")
Sending audio
Audio needs to be sent as raw PCM data (raw 16-bit PCM audio, 16kHz, little-endian). Construct a BidiGenerateContentRealtimeInput message with the audio data. The mimeType is crucial.

Python
JavaScript

# Inside the websocket context
async def send_audio_chunk(websocket, chunk_bytes):
    import base64
    encoded_data = base64.b64encode(chunk_bytes).decode('utf-8')
    audio_message = {
        "realtimeInput": {
            "audio": {
                "data": encoded_data,
                "mimeType": "audio/pcm;rate=16000"
            }
        }
    }
    await websocket.send(json.dumps(audio_message))
    # print("Sent audio chunk") # Avoid excessive logging

# Assuming 'chunk' is your raw PCM audio bytes
# await send_audio_chunk(websocket, chunk)
For an example of how to get the audio from the client device (e.g. the browser) see the end-to-end example on GitHub.

Sending video
Video frames are sent as individual images (e.g., JPEG or PNG). Similar to audio, use realtimeInput with a Blob, specifying the correct mimeType.

Python
JavaScript

# Inside the websocket context
async def send_video_frame(websocket, frame_bytes, mime_type="image/jpeg"):
    import base64
    encoded_data = base64.b64encode(frame_bytes).decode('utf-8')
    video_message = {
        "realtimeInput": {
            "video": {
                "data": encoded_data,
                "mimeType": mime_type
            }
        }
    }
    await websocket.send(json.dumps(video_message))
    # print("Sent video frame")

# Assuming 'frame' is your JPEG-encoded image bytes
# await send_video_frame(websocket, frame)
For an example of how to get the video from the client device (e.g. the browser) see the end-to-end example on GitHub.

Receiving responses
The WebSocket will send back BidiGenerateContentServerMessage messages. You need to parse these JSON messages and handle different types of content.

Python
JavaScript

# Inside the websocket context, in a receive loop
async def receive_loop(websocket):
    async for message in websocket:
        response = json.loads(message)
        print("Received:", response)

        if "serverContent" in response:
            server_content = response["serverContent"]
            # Receiving Audio
            if "modelTurn" in server_content and "parts" in server_content["modelTurn"]:
                for part in server_content["modelTurn"]["parts"]:
                    if "inlineData" in part:
                        audio_data_b64 = part["inlineData"]["data"]
                        # Process or play the base64 encoded audio data
                        # audio_data = base64.b64decode(audio_data_b64)
                        print(f"Received audio data (base64 len: {len(audio_data_b64)})")

            # Receiving Text Transcriptions
            if "inputTranscription" in server_content:
                print(f"User: {server_content['inputTranscription']['text']}")
            if "outputTranscription" in server_content:
                print(f"Gemini: {server_content['outputTranscription']['text']}")

        # Handling Tool Calls
        if "toolCall" in response:
            await handle_tool_call(websocket, response["toolCall"])

# Example usage: await receive_loop(websocket)
For an example of how to handle the response, see the end-to-end example on GitHub.

Handling tool calls
When the model requests a tool call, the BidiGenerateContentServerMessage will contain a toolCall field. You must execute the function locally and send the result back to the WebSocket using a BidiGenerateContentToolResponse message.

Python
JavaScript

# Placeholder for your tool function
def my_tool_function(args):
    print(f"Executing tool with args: {args}")
    # Implement your tool logic here
    return {"status": "success", "data": "some result"}

async def handle_tool_call(websocket, tool_call):
    function_responses = []
    for fc in tool_call["functionCalls"]:
        # 1. Execute the function locally
        try:
            result = my_tool_function(fc.get("args", {}))
            response_data = {"result": result}
        except Exception as e:
            print(f"Error executing tool {fc['name']}: {e}")
            response_data = {"error": str(e)}

        # 2. Prepare the response
        function_responses.append({
            "name": fc["name"],
            "id": fc["id"],
            "response": response_data
        })

    # 3. Send the tool response back to the session
    tool_response_message = {
        "toolResponse": {
            "functionResponses": function_responses
        }
    }
    await websocket.send(json.dumps(tool_response_message))
    print("Sent tool response")

# This function is called within the receive_loop when a toolCall is detected.
What's next
Read the full Live API Capabilities guide for key capabilities and configurations; including Voice Activity Detection and native audio features.
Read the Tool use guide to learn how to integrate Live API with tools and function calling.
Read the Session management guide for managing long running conversations.
Read the Ephemeral tokens guide for secure authentication in client-to-server applications.
For more information about the underlying WebSockets API, see the WebSockets API reference.


Live API capabilities guide




Preview: The Live API is in preview.
This is a comprehensive guide that covers capabilities and configurations available with the Live API. See Get started with Live API page for an overview and sample code for common use cases.

Before you begin
Familiarize yourself with core concepts: If you haven't already done so, read the Get started with Live API page first. This will introduce you to the fundamental principles of the Live API, how it works, and the different implementation approaches.
Try the Live API in AI Studio: You may find it useful to try the Live API in Google AI Studio before you start building. To use the Live API in Google AI Studio, select Stream.
Model comparison
The following table summarizes the key differences between the Gemini 3.1 Flash Live Preview and the Gemini 2.5 Flash Live Preview models:

Feature	Gemini 3.1 Flash Live Preview	Gemini 2.5 Flash Live Preview
Thinking	Uses thinkingLevel to control thinking depth with settings like minimal, low, medium, and high. Defaults to minimal to optimize for lowest latency. See Thinking levels and budgets.	Uses thinkingBudget to set the number of thinking tokens. Dynamic thinking is enabled by default. Set thinkingBudget to 0 to disable. See Thinking levels and budgets.
Receiving response	A single server event can contain multiple content parts simultaneously (for example, inlineData and transcript). Ensure your code processes all parts in each event to avoid missing content.	Each server event contains only one content part. Parts are delivered in separate events.
Client content	send_client_content is only supported for seeding initial context history (requires setting initial_history_in_client_content in session config). To send text updates during the conversation, use send_realtime_input instead.	send_client_content is supported throughout the conversation for sending incremental content updates and establishing context.
Turn coverage	Defaults to TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO. The model's turn includes detected audio activity and all video frames.	Defaults to TURN_INCLUDES_ONLY_ACTIVITY. The model's turn includes only the detected activity.
Custom VAD (activity_start/activity_end)	Supported. Disable automatic VAD and send activityStart and activityEnd messages manually to control turn boundaries.	Supported. Disable automatic VAD and send activityStart and activityEnd messages manually to control turn boundaries.
Automatic VAD configuration	Supported. Configure parameters such as start_of_speech_sensitivity, end_of_speech_sensitivity, prefix_padding_ms, and silence_duration_ms.	Supported. Configure parameters such as start_of_speech_sensitivity, end_of_speech_sensitivity, prefix_padding_ms, and silence_duration_ms.
Asynchronous function calling (behavior: NON_BLOCKING)	Not supported. Function calling is sequential only. The model will not start responding until you've sent the tool response.	Supported. Set behavior to NON_BLOCKING on a function declaration to let the model continue interacting while the function runs. Control how the model handles responses with the scheduling parameter (INTERRUPT, WHEN_IDLE, or SILENT).
Proactive audio	Not supported	Supported. When enabled, the model can proactively decide not to respond if the input content is not relevant. Set proactive_audio to true in the proactivity config (requires v1alpha).
Affective dialogue	Not supported	Supported. The model adapts its response style to match the expression and tone of the input. Set enable_affective_dialog to true in session config (requires v1alpha).
To migrate from Gemini 2.5 Flash Live to Gemini 3.1 Flash Live, see the migration guide.

Establishing a connection
The following example shows how to create a connection with an API key:

Python
JavaScript

import asyncio
from google import genai

client = genai.Client()

model = "gemini-3.1-flash-live-preview"
config = {"response_modalities": ["AUDIO"]}

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        print("Session started")
        # Send content...

if __name__ == "__main__":
    asyncio.run(main())
Interaction modalities
The following sections provide examples and supporting context for the different input and output modalities available in Live API.

Sending audio
Audio needs to be sent as raw PCM data (raw 16-bit PCM audio, 16kHz, little-endian).

Python
JavaScript

# Assuming 'chunk' is your raw PCM audio bytes
await session.send_realtime_input(
    audio=types.Blob(
        data=chunk,
        mime_type="audio/pcm;rate=16000"
    )
)
Audio formats
Audio data in the Live API is always raw, little-endian, 16-bit PCM. Audio output always uses a sample rate of 24kHz. Input audio is natively 16kHz, but the Live API will resample if needed so any sample rate can be sent. To convey the sample rate of input audio, set the MIME type of each audio-containing Blob to a value like audio/pcm;rate=16000.

Receiving audio
The model's audio responses are received as chunks of data.

Python
JavaScript

async for response in session.receive():
    if response.server_content and response.server_content.model_turn:
        for part in response.server_content.model_turn.parts:
            if part.inline_data:
                audio_data = part.inline_data.data
                # Process or play the audio data
Sending text
Text can be sent using send_realtime_input (Python) or sendRealtimeInput (JavaScript).

Python
JavaScript

await session.send_realtime_input(text="Hello, how are you?")
Sending video
Video frames are sent as individual images (e.g., JPEG or PNG) at a specific frame rate (max 1 frame per second).

Python
JavaScript

# Assuming 'frame' is your JPEG-encoded image bytes
await session.send_realtime_input(
    video=types.Blob(
        data=frame,
        mime_type="image/jpeg"
    )
)
Incremental content updates
Use incremental updates to send text input, establish session context, or restore session context. For short contexts you can send turn-by-turn interactions to represent the exact sequence of events:

Note: For gemini-3.1-flash-live-preview, send_client_content is only supported for seeding initial context history. You must set initial_history_in_client_content to true in the session config's history_config. After the first model turn, use send_realtime_input with the text field instead.
Python
JavaScript

turns = [
    {"role": "user", "parts": [{"text": "What is the capital of France?"}]},
    {"role": "model", "parts": [{"text": "Paris"}]},
]

await session.send_client_content(turns=turns, turn_complete=False)

turns = [{"role": "user", "parts": [{"text": "What is the capital of Germany?"}]}]

await session.send_client_content(turns=turns, turn_complete=True)
For longer contexts it's recommended to provide a single message summary to free up the context window for subsequent interactions. See Session Resumption for another method for loading session context.

Audio transcriptions
In addition to the model response, you can also receive transcriptions of both the audio output and the audio input.

To enable transcription of the model's audio output, send output_audio_transcription in the setup config. The transcription language is inferred from the model's response.

Python
JavaScript

import asyncio
from google import genai
from google.genai import types

client = genai.Client()
model = "gemini-3.1-flash-live-preview"

config = {
    "response_modalities": ["AUDIO"],
    "output_audio_transcription": {}
}

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        message = "Hello? Gemini are you there?"

        await session.send_client_content(
            turns={"role": "user", "parts": [{"text": message}]}, turn_complete=True
        )

        async for response in session.receive():
            if response.server_content.model_turn:
                print("Model turn:", response.server_content.model_turn)
            if response.server_content.output_transcription:
                print("Transcript:", response.server_content.output_transcription.text)

if __name__ == "__main__":
    asyncio.run(main())
To enable transcription of the model's audio input, send input_audio_transcription in setup config.

Python
JavaScript

import asyncio
from pathlib import Path
from google import genai
from google.genai import types

client = genai.Client()
model = "gemini-3.1-flash-live-preview"

config = {
    "response_modalities": ["AUDIO"],
    "input_audio_transcription": {},
}

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        audio_data = Path("16000.pcm").read_bytes()

        await session.send_realtime_input(
            audio=types.Blob(data=audio_data, mime_type='audio/pcm;rate=16000')
        )

        async for msg in session.receive():
            if msg.server_content.input_transcription:
                print('Transcript:', msg.server_content.input_transcription.text)

if __name__ == "__main__":
    asyncio.run(main())
Change voice and language
Native audio output models support any of the voices available for our Text-to-Speech (TTS) models. You can listen to all the voices in AI Studio.

To specify a voice, set the voice name within the speechConfig object as part of the session configuration:

Python
JavaScript

config = {
    "response_modalities": ["AUDIO"],
    "speech_config": {
        "voice_config": {"prebuilt_voice_config": {"voice_name": "Kore"}}
    },
}
Note: If you're using the generateContent API, the set of available voices is slightly different. See the audio generation guide for generateContent audio generation voices.
The Live API supports multiple languages. Native audio output models automatically choose the appropriate language and don't support explicitly setting the language code.

Native audio capabilities
Our latest models feature native audio output, which provides natural, realistic-sounding speech and improved multilingual performance.

Thinking
Gemini 3.1 models use thinkingLevel to control thinking depth, with settings like minimal, low, medium, and high. The default is minimal to optimize for lowest latency. Gemini 2.5 models use thinkingBudget to set the number of thinking tokens instead. For more details on levels vs budgets, see Thinking levels and budgets.

Python
JavaScript

model = "gemini-3.1-flash-live-preview"

config = types.LiveConnectConfig(
    response_modalities=["AUDIO"]
    thinking_config=types.ThinkingConfig(
        thinking_level="low",
    )
)

async with client.aio.live.connect(model=model, config=config) as session:
    # Send audio input and receive audio
Additionally, you can enable thought summaries by setting includeThoughts to true in your configuration. See thought summaries for more info:

Python
JavaScript

model = "gemini-3.1-flash-live-preview"

config = types.LiveConnectConfig(
    response_modalities=["AUDIO"]
    thinking_config=types.ThinkingConfig(
        thinking_level="low",
        include_thoughts=True
    )
)
Affective dialog
This feature lets Gemini adapt its response style to the input expression and tone.

Note: This feature is not supported in Gemini 3.1 Flash Live.
To use affective dialog, set the api version to v1alpha and set enable_affective_dialog to truein the setup message:

Python
JavaScript

client = genai.Client(http_options={"api_version": "v1alpha"})

config = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
    enable_affective_dialog=True
)
Proactive audio
When this feature is enabled, Gemini can proactively decide not to respond if the content is not relevant.

Note: This feature is not supported in Gemini 3.1 Flash Live.
To use it, set the api version to v1alpha and configure the proactivity field in the setup message and set proactive_audio to true:

Python
JavaScript

client = genai.Client(http_options={"api_version": "v1alpha"})

config = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
    proactivity={'proactive_audio': True}
)
Voice Activity Detection (VAD)
Voice Activity Detection (VAD) allows the model to recognize when a person is speaking. This is essential for creating natural conversations, as it allows a user to interrupt the model at any time.

When VAD detects an interruption, the ongoing generation is canceled and discarded. Only the information already sent to the client is retained in the session history. The server then sends a BidiGenerateContentServerContent message to report the interruption.

The Gemini server then discards any pending function calls and sends a BidiGenerateContentServerContent message with the IDs of the canceled calls.

Python
JavaScript

async for response in session.receive():
    if response.server_content.interrupted is True:
        # The generation was interrupted

        # If realtime playback is implemented in your application,
        # you should stop playing audio and clear queued playback here.
Automatic VAD
By default, the model automatically performs VAD on a continuous audio input stream. VAD can be configured with the realtimeInputConfig.automaticActivityDetection field of the setup configuration.

When the audio stream is paused for more than a second (for example, because the user switched off the microphone), an audioStreamEnd event should be sent to flush any cached audio. The client can resume sending audio data at any time.

Python
JavaScript

# example audio file to try:
# URL = "https://storage.googleapis.com/generativeai-downloads/data/hello_are_you_there.pcm"
# !wget -q $URL -O sample.pcm
import asyncio
from pathlib import Path
from google import genai
from google.genai import types

client = genai.Client()
model = "gemini-3.1-flash-live-preview"

config = {"response_modalities": ["AUDIO"]}

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        audio_bytes = Path("sample.pcm").read_bytes()

        await session.send_realtime_input(
            audio=types.Blob(data=audio_bytes, mime_type="audio/pcm;rate=16000")
        )

        # if stream gets paused, send:
        # await session.send_realtime_input(audio_stream_end=True)

        async for response in session.receive():
            if response.text is not None:
                print(response.text)

if __name__ == "__main__":
    asyncio.run(main())
With send_realtime_input, the API will respond to audio automatically based on VAD. While send_client_content adds messages to the model context in order, send_realtime_input is optimized for responsiveness at the expense of deterministic ordering.

Automatic VAD configuration
For more control over the VAD activity, you can configure the following parameters. See API reference for more info.

Python
JavaScript

from google.genai import types

config = {
    "response_modalities": ["AUDIO"],
    "realtime_input_config": {
        "automatic_activity_detection": {
            "disabled": False, # default
            "start_of_speech_sensitivity": types.StartSensitivity.START_SENSITIVITY_LOW,
            "end_of_speech_sensitivity": types.EndSensitivity.END_SENSITIVITY_LOW,
            "prefix_padding_ms": 20,
            "silence_duration_ms": 100,
        }
    }
}
Disable automatic VAD
Alternatively, the automatic VAD can be disabled by setting realtimeInputConfig.automaticActivityDetection.disabled to true in the setup message. In this configuration the client is responsible for detecting user speech and sending activityStart and activityEnd messages at the appropriate times. An audioStreamEnd isn't sent in this configuration. Instead, any interruption of the stream is marked by an activityEnd message.

Python
JavaScript

config = {
    "response_modalities": ["AUDIO"],
    "realtime_input_config": {"automatic_activity_detection": {"disabled": True}},
}

async with client.aio.live.connect(model=model, config=config) as session:
    # ...
    await session.send_realtime_input(activity_start=types.ActivityStart())
    await session.send_realtime_input(
        audio=types.Blob(data=audio_bytes, mime_type="audio/pcm;rate=16000")
    )
    await session.send_realtime_input(activity_end=types.ActivityEnd())
    # ...
Understanding VAD parameters and their impact on quality
When using automatic VAD, two key parameters control how audio is segmented into speech turns before being sent to the model:

prefixPaddingMs: The amount of audio to include before speech is detected. This "look-back" ensures the model captures the full onset of speech, including the first syllable which may start before the VAD triggers. A value of 0 may cause the beginning of words to be clipped.
silenceDurationMs: How long the server waits through silence before ending a speech turn. This determines how tolerant the system is of natural mid-sentence pauses (e.g., thinking, breathing, or clause boundaries).
Impact of silenceDurationMs on audio quality
The silenceDurationMs value directly affects the size and completeness of audio chunks the model receives for processing:

Recommended (500ms–800ms): Provides a good balance—the model receives complete, contextually rich audio chunks while keeping latency reasonable. The server's internal default is approximately 800ms.
Too low (e.g., 100ms–200ms): The system ends speech turns during natural pauses, splitting a single utterance into multiple small audio fragments. The model receives these fragments individually, losing cross-fragment context and resulting in lower transcription and response quality.
Too high (e.g., 2000ms+): The system waits a long time after the user stops speaking, increasing perceived latency before the model responds.
Best practices for manual (client-side) VAD
When you disable automatic VAD and manage activityStart/activityEnd signals from your own client-side voice detection, be aware that the server's built-in audio buffering mechanisms are bypassed. This means:

No pre-speech buffer: The server no longer prepends audio before the detected speech start. Your client should include sufficient audio context before sending activityStart.
No silence tolerance: The server acts immediately on your activityEnd signal with no additional wait. If your client-side VAD uses an aggressive end-of-speech threshold (e.g., 200ms of silence), speech may be cut off mid-sentence during natural pauses.
To preserve audio quality with manual VAD, use an end-of-speech silence threshold of at least 500ms in your client's voice activity detector. Thresholds below this value often cause fragmented audio that degrades transcription and model response quality.

Token count
You can find the total number of consumed tokens in the usageMetadata field of the returned server message.

Python
JavaScript

async for message in session.receive():
    # The server will periodically send messages that include UsageMetadata.
    if message.usage_metadata:
        usage = message.usage_metadata
        print(
            f"Used {usage.total_token_count} tokens in total. Response token breakdown:"
        )
        for detail in usage.response_tokens_details:
            match detail:
                case types.ModalityTokenCount(modality=modality, token_count=count):
                    print(f"{modality}: {count}")
Media resolution
You can specify the media resolution for the input media by setting the mediaResolution field as part of the session configuration:

Python
JavaScript

from google.genai import types

config = {
    "response_modalities": ["AUDIO"],
    "media_resolution": types.MediaResolution.MEDIA_RESOLUTION_LOW,
}
Limitations
Consider the following limitations of the Live API when you plan your project.

Response modalities
The native audio models only support `AUDIO response modality. If you need the model response as text, use the output audio transcription feature.

Client authentication
The Live API only provides server-to-server authentication by default. If you're implementing your Live API application using a client-to-server approach, you need to use ephemeral tokens to mitigate security risks.

Session duration
Audio-only sessions are limited to 15 minutes, and audio plus video sessions are limited to 2 minutes. However, you can configure different session management techniques for unlimited extensions on session duration.

Context window
A session has a context window limit of:

128k tokens for native audio output models
32k tokens for other Live API models
Supported languages
Live API supports the following 97 languages.

Note: Native audio output models can switch between languages naturally during conversation. You can also restrict the languages it speaks in by specifying it in the system instructions.
Language	BCP-47 Code	Language	BCP-47 Code
Afrikaans	af	Latvian	lv
Akan	ak	Lithuanian	lt
Albanian	sq	Macedonian	mk
Amharic	am	Malay	ms
Arabic	ar	Malayalam	ml
Armenian	hy	Maltese	mt
Assamese	as	Maori	mi
Azerbaijani	az	Marathi	mr
Basque	eu	Mongolian	mn
Belarusian	be	Nepali	ne
Bengali	bn	Norwegian	no
Bosnian	bs	Odia	or
Bulgarian	bg	Oromo	om
Burmese	my	Pashto	ps
Catalan	ca	Persian	fa
Cebuano	ceb	Polish	pl
Chinese	zh	Portuguese	pt
Croatian	hr	Punjabi	pa
Czech	cs	Quechua	qu
Danish	da	Romanian	ro
Dutch	nl	Romansh	rm
English	en	Russian	ru
Estonian	et	Serbian	sr
Faroese	fo	Sindhi	sd
Filipino	fil	Sinhala	si
Finnish	fi	Slovak	sk
French	fr	Slovenian	sl
Galician	gl	Somali	so
Georgian	ka	Southern Sotho	st
German	de	Spanish	es
Greek	el	Swahili	sw
Gujarati	gu	Swedish	sv
Hausa	ha	Tajik	tg
Hebrew	iw	Tamil	ta
Hindi	hi	Telugu	te
Hungarian	hu	Thai	th
Icelandic	is	Tswana	tn
Indonesian	id	Turkish	tr
Irish	ga	Turkmen	tk
Italian	it	Ukrainian	uk
Japanese	ja	Urdu	ur
Kannada	kn	Uzbek	uz
Kazakh	kk	Vietnamese	vi
Khmer	km	Welsh	cy
Kinyarwanda	rw	Western Frisian	fy
Korean	ko	Wolof	wo
Kurdish	ku	Yoruba	yo
Kyrgyz	ky	Zulu	zu
Lao	lo		
What's next
Read the Tool Use and Session Management guides for essential information on using the Live API effectively.
Try the Live API in Google AI Studio.
For more info about the Live API models, see Gemini 2.5 Flash Native Audio on the Models page.
Try more examples in the Live API cookbook, the Live API Tools cookbook, and the Live API Get Started script.


Tool use with Live API




Tool use allows Live API to go beyond just conversation by enabling it to perform actions in the real-world and pull in external context while maintaining a real time connection. You can define tools such as Function calling and Google Search with the Live API.

Overview of supported tools
Here's a brief overview of the available tools for Live API models:

Tool	Gemini 3.1 Flash Live Preview	Gemini 2.5 Flash Live Preview
Search	Supported	Supported
Function calling	Supported (synchronous only)	Supported (synchronous and asynchronous)
Google Maps	Not supported	Not supported
Code execution	Not supported	Not supported
URL context	Not supported	Not supported
Function calling
Live API supports function calling, just like regular content generation requests. Function calling lets the Live API interact with external data and programs, greatly increasing what your applications can accomplish.

You can define function declarations as part of the session configuration. After receiving tool calls, the client should respond with a list of FunctionResponse objects using the session.send_tool_response method.

See the Function calling tutorial to learn more.

Note: Unlike the generateContent API, the Live API doesn't support automatic tool response handling. You must handle tool responses manually in your client code.
Python
JavaScript

import asyncio
import wave
from google import genai
from google.genai import types

client = genai.Client()

model = "gemini-3.1-flash-live-preview"

# Simple function definitions
turn_on_the_lights = {"name": "turn_on_the_lights"}
turn_off_the_lights = {"name": "turn_off_the_lights"}

tools = [{"function_declarations": [turn_on_the_lights, turn_off_the_lights]}]
config = {"response_modalities": ["AUDIO"], "tools": tools}

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        prompt = "Turn on the lights please"
        await session.send_client_content(turns={"parts": [{"text": prompt}]})

        wf = wave.open("audio.wav", "wb")
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(24000)  # Output is 24kHz

        async for response in session.receive():
            if response.data is not None:
                wf.writeframes(response.data)
            elif response.tool_call:
                print("The tool was called")
                function_responses = []
                for fc in response.tool_call.function_calls:
                    function_response = types.FunctionResponse(
                        id=fc.id,
                        name=fc.name,
                        response={ "result": "ok" } # simple, hard-coded function response
                    )
                    function_responses.append(function_response)

                await session.send_tool_response(function_responses=function_responses)

        wf.close()

if __name__ == "__main__":
    asyncio.run(main())
From a single prompt, the model can generate multiple function calls and the code necessary to chain their outputs. This code executes in a sandbox environment, generating subsequent BidiGenerateContentToolCall messages.

Asynchronous function calling
Function calling executes sequentially by default, meaning execution pauses until the results of each function call are available. This ensures sequential processing, which means you won't be able to continue interacting with the model while the functions are being run.

Note: Asynchronous function calling is not yet supported in Gemini 3.1 Flash Live. The model will not start responding until you've sent the tool response.
If you don't want to block the conversation, you can tell the model to run the functions asynchronously. To do so, you first need to add a behavior to the function definitions:

Python
JavaScript

# Non-blocking function definitions
turn_on_the_lights = {"name": "turn_on_the_lights", "behavior": "NON_BLOCKING"} # turn_on_the_lights will run asynchronously
turn_off_the_lights = {"name": "turn_off_the_lights"} # turn_off_the_lights will still pause all interactions with the model
NON-BLOCKING ensures the function runs asynchronously while you can continue interacting with the model.

Then you need to tell the model how to behave when it receives the FunctionResponse using the scheduling parameter. It can either:

Interrupt what it's doing and tell you about the response it got right away (scheduling="INTERRUPT"),
Wait until it's finished with what it's currently doing (scheduling="WHEN_IDLE"),
Or do nothing and use that knowledge later on in the discussion (scheduling="SILENT")

Python
JavaScript

# for a non-blocking function definition, apply scheduling in the function response:
  function_response = types.FunctionResponse(
      id=fc.id,
      name=fc.name,
      response={
          "result": "ok",
          "scheduling": "INTERRUPT" # Can also be WHEN_IDLE or SILENT
      }
  )
Grounding with Google Search
You can enable Grounding with Google Search as part of the session configuration. This increases the Live API's accuracy and prevents hallucinations. See the Grounding tutorial to learn more.

Python
JavaScript

import asyncio
import wave
from google import genai
from google.genai import types

client = genai.Client()

model = "gemini-3.1-flash-live-preview"

tools = [{'google_search': {}}]
config = {"response_modalities": ["AUDIO"], "tools": tools}

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        prompt = "When did the last Brazil vs. Argentina soccer match happen?"
        await session.send_client_content(turns={"parts": [{"text": prompt}]})

        wf = wave.open("audio.wav", "wb")
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(24000)  # Output is 24kHz

        async for chunk in session.receive():
            if chunk.server_content:
                if chunk.data is not None:
                    wf.writeframes(chunk.data)

                # The model might generate and execute Python code to use Search
                model_turn = chunk.server_content.model_turn
                if model_turn:
                    for part in model_turn.parts:
                        if part.executable_code is not None:
                            print(part.executable_code.code)

                        if part.code_execution_result is not None:
                            print(part.code_execution_result.output)

        wf.close()

if __name__ == "__main__":
    asyncio.run(main())
Combining multiple tools
You can combine multiple tools within the Live API, increasing your application's capabilities even more:

Python
JavaScript

prompt = """
Hey, I need you to do two things for me.

1. Use Google Search to look up information about the largest earthquake in California the week of Dec 5 2024?
2. Then turn on the lights

Thanks!
"""

tools = [
    {"google_search": {}},
    {"function_declarations": [turn_on_the_lights, turn_off_the_lights]},
]

config = {"response_modalities": ["AUDIO"], "tools": tools}

# ... remaining model call
What's next
Check out more examples of using tools with the Live API in the Tool use cookbook.
Get the full story on features and configurations from the Live API Capabilities guide.


Session management with Live API



In the Live API, a session refers to a persistent connection where input and output are streamed continuously over the same connection (read more about how it works). This unique session design enables low latency and supports unique features, but can also introduce challenges, like session time limits, and early termination. This guide covers strategies for overcoming the session management challenges that can arise when using the Live API.

Session lifetime
Without compression, audio-only sessions are limited to 15 minutes, and audio-video sessions are limited to 2 minutes. Exceeding these limits will terminate the session (and therefore, the connection), but you can use context window compression to extend sessions to an unlimited amount of time.

The lifetime of a connection is limited as well, to around 10 minutes. When the connection terminates, the session terminates as well. In this case, you can configure a single session to stay active over multiple connections using session resumption. You'll also receive a GoAway message before the connection ends, allowing you to take further actions.

Context window compression
To enable longer sessions, and avoid abrupt connection termination, you can enable context window compression by setting the contextWindowCompression field as part of the session configuration.

In the ContextWindowCompressionConfig, you can configure a sliding-window mechanism and the number of tokens that triggers compression.

Python
JavaScript

from google.genai import types

config = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
    context_window_compression=(
        # Configures compression with default parameters.
        types.ContextWindowCompressionConfig(
            sliding_window=types.SlidingWindow(),
        )
    ),
)
Session resumption
To prevent session termination when the server periodically resets the WebSocket connection, configure the sessionResumption field within the setup configuration.

Passing this configuration causes the server to send SessionResumptionUpdate messages, which can be used to resume the session by passing the last resumption token as the SessionResumptionConfig.handle of the subsequent connection.

Resumption tokens are valid for 2 hr after the last sessions termination.

Python
JavaScript

import asyncio
from google import genai
from google.genai import types

client = genai.Client()
model = "gemini-3.1-flash-live-preview"

async def main():
    print(f"Connecting to the service with handle {previous_session_handle}...")
    async with client.aio.live.connect(
        model=model,
        config=types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            session_resumption=types.SessionResumptionConfig(
                # The handle of the session to resume is passed here,
                # or else None to start a new session.
                handle=previous_session_handle
            ),
        ),
    ) as session:
        while True:
            await session.send_client_content(
                turns=types.Content(
                    role="user", parts=[types.Part(text="Hello world!")]
                )
            )
            async for message in session.receive():
                # Periodically, the server will send update messages that may
                # contain a handle for the current state of the session.
                if message.session_resumption_update:
                    update = message.session_resumption_update
                    if update.resumable and update.new_handle:
                        # The handle should be retained and linked to the session.
                        return update.new_handle

                # For the purposes of this example, placeholder input is continually fed
                # to the model. In non-sample code, the model inputs would come from
                # the user.
                if message.server_content and message.server_content.turn_complete:
                    break

if __name__ == "__main__":
    asyncio.run(main())
Receiving a message before the session disconnects
T

[Message truncated - exceeded 50,000 character limit]
