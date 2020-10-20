## [Demo Video](https://www.youtube.com/watch?v=vfPoTQ22kvE)

![Demo Gif](https://s8.gifyu.com/images/Signify.gif)

## What our app does:

SIGNify is an innovative app that closes the communication gap faced by members of the Deaf and Hard of Hearing communities, who primarily use American Sign Language (ASL) to communicate. SIGNify uses Artificial Intelligence and Machine Learning to recognize ASL signs and convert them into text and audio, allowing Deaf individuals to use sign language to communicate with those who are unfamiliar with it. SIGNify has the potential to make a positive impact for the approximately 600,000 Deaf individuals in the US.
In this pilot version of SIGNify, Deaf individuals can fingerspell (use ASL alphabet signs to spell out words) words into their phone or laptop camera. The app then uses a machine learning model to predict the letter being signed in each frame of the video. It collects the stream of predicted letters and uses a filtering algorithm to extract the text being signed. It has an autocorrect feature to correct any misspelled words, in case the model misses or wrongly classifies a letter. After the user finishes signing their text, the app reads out the text using text-to-speech.

## What inspired us to create it:

There are approximately 600,000 Deaf people in the US, and more than 1 out of every 500 children is born with hearing loss, according to the National Institute on Deafness and Communication Disorders. These members of the Deaf community primarily use American Sign Language to communicate between themselves, however, with the exception of Deaf individuals and their close friends and family members, most people do not know sign language. This makes it difficult for Deaf individuals to communicate with someone outside of their close circle. Common approaches such as writing out or typing text are slow and interrupt the flow of conversation, making them less than desirable. Through our research, we concluded that there are no released apps available that translate between ASL and English, allowing for natural conversation between a Deaf individual and a hearing individual. As a result, we decided to develop one ourselves, building on our knowledge of machine learning and web app design. We believe that communication is a fundamental human right, and all individuals should be able to effectively and naturally communicate with others in the way they choose, and we sincerely hope that SIGNify helps members of the Deaf community achieve this goal.

## Difficulties we faced programming our app:

The biggest technical difficulty we faced in programming this app was developing and training a machine learning model that could accurately identify hand signs in video frames. We were able to solve this challenge by utilizing an OpenCV edge-detection transformation to give the Convolutional Neural Network a simpler image to extract information from, making it easier for it to “learn” how to classify frames into letters. We also used Transfer Learning (from a pre-trained model known as MobileNetV2) to give the model richer “prior knowledge” and thus a better chance of classifying images correctly. Additionally, we had to sacrifice some accuracy to improve the performance of our model, as our initial revisions were too slow to run in real-time on a cell phone CPU. We compensated for this by introducing the autocorrect feature, allowing the model to miss some letters while still producing the correct text. As a result, we were able to find a good balance between accuracy and speed for our final model, which runs at 15 FPS on the average cell phone and still ensures a satisfactory user experience.

## What we would improve on if we were to make a version 2:

We have many ideas in mind for a second version of our app. Firstly, we would like to upgrade our machine learning model to recognize common ASL words rather than only fingerspelling, which will greatly reduce the time it takes for users to input long words. We would also like to train our model to ignore the background by providing it a more diverse range of samples, allowing it to be effective in many more ad-hoc situations. Additionally, we would like to try to incorporate our app with video conferencing software such as Zoom, which will allow users to communicate naturally on conference calls. Finally, we would like to present our app to a group of Deaf individuals and use their feedback to fine-tune the app.

## Built With

1. Python
2. Tensorflow
3. Keras
4. OpenCV
5. JavaScript
6. HTML/CSS
7. React
8. Next.js
