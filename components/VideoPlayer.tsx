"use client"; // This marks the file as a client-side component in Next.js

import { useState, useRef } from "react"; // Import React hooks for managing state and references
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"; // Import components for displaying the popup dialog

// Define the structure of a multiple-choice question
interface MCQQuestion {
  question: string; // The question text
  options: string[]; // An array of options for the user to choose from
  correct: string; // The correct answer
  time: number; // The time in seconds when the MCQ should appear
  attempted: boolean; // Whether the question has been answered yet
  userAnswer: string; // The answer provided by the user
}

// Array of predefined questions
const questions: MCQQuestion[] = [
  {
    time: 5, // Show this question at 5 seconds into the video
    question: "What is the capital of France?", // The question
    options: ["Paris", "London", "Berlin"], // Answer options
    correct: "Paris", // Correct answer
    attempted: false, // Initially not attempted
    userAnswer: "", // Initially no answer
  },
  {
    time: 10, // Show this question at 10 seconds into the video
    question: "What is 2 + 2?", // The question
    options: ["3", "4", "5"], // Answer options
    correct: "4", // Correct answer
    attempted: false, // Initially not attempted
    userAnswer: "", // Initially no answer
  },
];

const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null); // A reference to the video element
  const [showMCQ, setShowMCQ] = useState<boolean>(false); // State to control visibility of the question popup
  const [videoPaused, setVideoPaused] = useState<boolean>(false); // State to track whether the video is paused
  const [userAnswer, setUserAnswer] = useState<string | null>(null); // State to store the user's answer result (correct/incorrect)
  const [videoIsOver, setVideoIsOver] = useState<boolean>(false); // State to track whether the video has ended
  const [showResults, setShowResults] = useState<boolean>(false); // State to control visibility of the results dialog
  const [fetchedQuestions, setFetchedQuestions] =
    useState<MCQQuestion[]>(questions); // State to hold the list of questions
  const [currentQuestion, setCurrentQuestion] = useState<MCQQuestion | null>(
    null
  ); // State to store the current question being displayed

  // Function that runs whenever the video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setVideoIsOver(false); // Reset the videoIsOver state when the video is playing
      const currentTime = videoRef.current.currentTime; // Get the current time of the video
      const videoDuration = videoRef.current.duration; // Get the total duration of the video

      // Check if it's time to show a new MCQ (based on time and whether it's been answered)
      const _currentQuestion = fetchedQuestions.find(
        (q) =>
          currentTime >= q.time && // Is the current time >= the time when the question should appear?
          currentTime < q.time + 1 && // Show the question within a 1-second window to avoid rapid firing
          !q.attempted && // Only show if the question hasn't been answered yet
          !showMCQ // Ensure a question is not already being shown
      );

      if (_currentQuestion) {
        // If a new question is found, set it to the state and show the popup
        setCurrentQuestion(_currentQuestion);
        setShowMCQ(true); // Show the MCQ dialog
        videoRef.current.pause(); // Pause the video when the question appears
        setVideoPaused(true); // Mark the video as paused
      }

      if (currentTime >= videoDuration) {
        // If the video has ended, set the videoIsOver state to true
        setVideoIsOver(true);
        // return;
      }
    }
  };

  // Function to handle the user's answer
  const handleAnswer = (answer: string) => {
    // Mark the question as attempted once an answer is selected
    if (currentQuestion) {
      setFetchedQuestions(
        (prev) =>
          prev.map((q) =>
            q === currentQuestion
              ? {
                  ...q,
                  attempted: true,
                  userAnswer: answer,
                }
              : q
          ) // Update the attempted flag
      );
    }

    // Check if the answer is correct or incorrect
    if (answer === currentQuestion?.correct) {
      setUserAnswer("correct"); // Set user answer state to 'correct' if the answer matches
    } else {
      setUserAnswer("incorrect"); // Set user answer state to 'incorrect' if the answer doesn't match
    }
  };

  return (
    <div className="h-full relative">
      {/* Video element */}
      <video
        width={700} // Set the width of the video
        ref={videoRef} // Attach the videoRef to this video element
        src="https://videos.pexels.com/video-files/1536315/1536315-hd_1920_1080_30fps.mp4" // Video source
        onTimeUpdate={handleTimeUpdate} // Attach the handleTimeUpdate function to the 'onTimeUpdate' event
        controls // Enable video controls (play/pause/volume)
        className="rounded-lg shadow-lg" // Apply some styling to the video
      />

      {/* Display the results dialog when the video ends */}
      {videoIsOver && (
        <Dialog
          open={videoIsOver} // Open the dialog if videoIsOver is true
          onOpenChange={(state) => {
            if (!state) {
              // If the dialog is closed, reset the states
              setVideoIsOver(false);
              setShowResults(false);
              setCurrentQuestion(null);
            }
          }}
        >
          {/* Dialog content for the results */}
          <DialogContent className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <DialogTitle>Results</DialogTitle>
            <div className="my-4 max-h-[400px] overflow-y-auto">
              {/* Display the results of each question */}
              {fetchedQuestions.map((question, qi) => {
                return (
                  <div
                    key={qi} // Unique key for each result
                    className="border-y py-2"
                  >
                    <h1 className="font-semibold">{question.question}</h1>
                    <div className="mt-2">
                      {question.options.map((option, ai) => (
                        <div
                          key={option}
                          className={`flex justify-between p-2 my-2 rounded-lg ${
                            question.attempted
                              ? question.correct === question.userAnswer
                                ? question.correct === option
                                  ? "bg-green-200"
                                  : "bg-white"
                                : question.correct === option
                                ? "bg-green-200"
                                : question.userAnswer === option
                                ? "bg-red-200"
                                : "bg-white"
                              : question.correct === option
                              ? "bg-green-200"
                              : "bg-white"
                          }`}
                        >
                          <p>
                            {ai + 1}. {option}
                          </p>
                          {/* <p>
                            {question.correct === option
                              ? "Correct"
                              : question.attempted && !question.isUserCorrect
                              ? "Incorrect"
                              : ""}
                          </p> */}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Display the question popup if a question is being shown */}
      {showMCQ && currentQuestion && (
        <Dialog
          open={showMCQ} // Open the dialog if showMCQ is true
          onOpenChange={(state) => {
            if (!state) {
              if (!userAnswer) {
                return; // If the dialog is closed without answering, do nothing
              }

              // If the dialog is closed, resume the video and reset the states
              setVideoPaused(false);
              videoRef.current?.play(); // Play the video again
              setUserAnswer(null); // Reset the answer state
            }
            setShowMCQ(state); // Update the showMCQ state when dialog is closed or opened
          }}
        >
          {/* Dialog content for the MCQ */}
          <DialogContent className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <DialogTitle>{currentQuestion.question}</DialogTitle>{" "}
            {/* Display the question */}
            <DialogDescription className="my-4">
              {/* Render options as buttons */}
              {currentQuestion.options.map((option) => (
                <button
                  disabled={userAnswer !== null} // Disable the button if the user has already answered
                  key={option} // Unique key for each option
                  onClick={() => handleAnswer(option)} // Call handleAnswer when an option is clicked
                  className="block w-full p-3 my-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  {option} {/* Display the option text */}
                </button>
              ))}
            </DialogDescription>
            {/* Display the user's answer */}
            {userAnswer && (
              <p
                className={`text-center text-lg font-semibold mt-4 ${
                  userAnswer === "correct" ? "text-green-500" : "text-red-500"
                }`}
              >
                {userAnswer === "correct"
                  ? "Your answer is correct!"
                  : "Your answer is incorrect!"}
              </p>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Show a message when the video is paused */}
      {videoPaused && (
        <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xl">
          Video is paused until you answer the question.
        </p>
      )}
    </div>
  );
};

export default VideoPlayer; // Export the VideoPlayer component for use in other parts of the app
