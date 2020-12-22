const Alexa = require('ask-sdk-core');
const messages = require('./messages');

const LaunchRequest = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
    );
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const attributes = {};

    attributes.gameState = 'STARTED';
    attributes.currentNumber = 1;

    attributesManager.setSessionAttributes(attributes);

    return handlerInput.responseBuilder
      .speak(messages.LAUNCH_MESSAGE)
      .reprompt(messages.CONTINUE_MESSAGE)
      .getResponse();
  }
};

const ExitHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'AMAZON.CancelIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          'AMAZON.StopIntent')
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.EXIT_MESSAGE)
      .getResponse();
  }
};

const SessionEndedRequest = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      'SessionEndedRequest'
    );
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`
    );
    return handlerInput.responseBuilder.getResponse();
  }
};

const RepeatIntent = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'AMAZON.RepeatIntent'
    );
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();

    const currentNumber = sessionAttributes.currentNumber;
    const AlexaResponse = convertToFizzBuzz(currentNumber);

    return handlerInput.responseBuilder
      .speak(AlexaResponse.toString())
      .reprompt(messages.CONTINUE_MESSAGE)
      .getResponse();
  }
};

const HelpIntent = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.HELP_MESSAGE)
      .reprompt(messages.CONTINUE_MESSAGE)
      .getResponse();
  }
};

const UnhandledIntent = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.CONTINUE_MESSAGE)
      .reprompt(messages.CONTINUE_MESSAGE)
      .getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);

    return handlerInput.responseBuilder
      .speak(messages.ERROR_MESSAGE)
      .reprompt(messages.ERROR_MESSAGE)
      .getResponse();
  }
};

// Handle the case when user says a number
const NumberIntent = {
  canHandle(handlerInput) {
    let isCurrentlyPlaying = false;
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (
      sessionAttributes.gameState &&
      sessionAttributes.gameState === 'STARTED'
    ) {
      isCurrentlyPlaying = true;
    }

    return (
      isCurrentlyPlaying &&
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'NumberIntent' &&
      Alexa.getSlotValue(handlerInput.requestEnvelope, 'number') !== '?'
    );
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();

    const UserResponse = parseInt(
      Alexa.getSlotValue(handlerInput.requestEnvelope, 'number'),
      10
    );
    let currentNumber = sessionAttributes.currentNumber + 1;
    const correctAnswer = convertToFizzBuzz(currentNumber);

    if (UserResponse !== correctAnswer) {
      sessionAttributes.gameState = 'ENDED';
      const speechOutput = messages.GAME_LOSE_MESSAGE_FIRST_PART.concat(
        correctAnswer.toString(),
        messages.GAME_LOSE_MESSAGE_LAST_PART
      );
      return handlerInput.responseBuilder.speak(speechOutput).getResponse();
    }

    currentNumber += 1;
    sessionAttributes.currentNumber = currentNumber;
    const AlexaResponse = convertToFizzBuzz(currentNumber);

    return handlerInput.responseBuilder
      .speak(AlexaResponse.toString())
      .reprompt(messages.CONTINUE_MESSAGE)
      .getResponse();
  }
};

// Handle the case when user says fizz, buzz or fizz buzz
const FizzBuzzIntent = {
  canHandle(handlerInput) {
    let isCurrentlyPlaying = false;
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (
      sessionAttributes.gameState &&
      sessionAttributes.gameState === 'STARTED'
    ) {
      isCurrentlyPlaying = true;
    }

    return (
      isCurrentlyPlaying &&
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'FizzBuzzIntent'
    );
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();

    const UserResponse = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      'fizzbuzz'
    );
    let currentNumber = sessionAttributes.currentNumber + 1;
    const correctAnswer = convertToFizzBuzz(currentNumber);

    if (UserResponse !== correctAnswer) {
      sessionAttributes.gameState = 'ENDED';
      const speechOutput = messages.GAME_LOSE_MESSAGE_FIRST_PART.concat(
        correctAnswer.toString(),
        messages.GAME_LOSE_MESSAGE_LAST_PART
      );
      return handlerInput.responseBuilder.speak(speechOutput).getResponse();
    }

    currentNumber += 1;
    sessionAttributes.currentNumber = currentNumber;
    const AlexaResponse = convertToFizzBuzz(currentNumber);

    return handlerInput.responseBuilder
      .speak(AlexaResponse.toString())
      .reprompt(messages.CONTINUE_MESSAGE)
      .getResponse();
  }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequest,
    ExitHandler,
    SessionEndedRequest,
    RepeatIntent,
    HelpIntent,
    FizzBuzzIntent,
    NumberIntent,
    UnhandledIntent
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

// Convert the number into correct value in the fizz buzz game
function convertToFizzBuzz(num) {
  const divisibleBy3 = num % 3 === 0;
  const divisibleBy5 = num % 5 === 0;
  if (divisibleBy3 && divisibleBy5) {
    return 'fizz buzz';
  } else if (divisibleBy3) {
    return 'fizz';
  } else if (divisibleBy5) {
    return 'buzz';
  }
  return num;
}
