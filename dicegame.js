const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function generateRandomNumber(maxValue) {
  const randomBytes = crypto.randomBytes(32);
  const randomInt = randomBytes[0] % (maxValue + 1);
  const hmac = crypto.createHmac('sha256', randomBytes).digest('hex');
  const key = randomBytes.toString('hex');
  return { randomInt, hmac, key };
}

async function promptSelection(promptText, validOptions) {
  let selection;
  while (!validOptions.includes(selection)) {
    selection = (await askQuestion(promptText)).trim();
    if (!validOptions.includes(selection)) {
      console.error("Invalid selection. Try again.");
    }
  }
  return selection;
}

async function playDiceGame(dice1, dice2) {
  console.log(`I make the first move and choose the [${dice2.join(",")}] dice.`);

  const userDiceChoice = await promptSelection(
    `Choose your dice:\n0 - ${dice1.join(",")}\n1 - ${dice2.join(",")}\nX - exit\n? - help\n> `,
    ["0", "1", "X", "?"]
  );

  if (userDiceChoice === "X") {
    console.log("Exiting the game. Goodbye!");
    rl.close();
    return;
  } else if (userDiceChoice === "?") {
    console.log("Help: Choose a dice by entering 0 or 1. X exits the game.");
    rl.close();
    return;
  }

  const userDice = userDiceChoice === "0" ? dice1 : dice2;
  console.log(`You choose the [${userDice.join(",")}] dice.`);

  const computerThrow1 = generateRandomNumber(5);
  console.log(`It's time for my throw.`);
  console.log(`I selected a random value in the range 0..5 (HMAC=${computerThrow1.hmac}).`);
  const userInput1 = parseInt(
    await promptSelection(
      `Add your number modulo 6.\n0 - 0\n1 - 1\n2 - 2\n3 - 3\n4 - 4\n5 - 5\nX - exit\n? - help\n> `,
      ["0", "1", "2", "3", "4", "5", "X", "?"]
    ),
    10
  );
  console.log(`My number is ${computerThrow1.randomInt} (KEY=${computerThrow1.key}).`);
  const result1 = (computerThrow1.randomInt + userInput1) % 6;
  console.log(`The result is ${computerThrow1.randomInt} + ${userInput1} = ${result1} (mod 6).`);
  const computerResult1 = dice2[computerThrow1.randomInt];
  console.log(`My throw is ${computerResult1}.`);

  const computerThrow2 = generateRandomNumber(5);
  console.log(`It's time for your throw.`);
  console.log(`I selected a random value in the range 0..5 (HMAC=${computerThrow2.hmac}).`);
  const userInput2 = parseInt(
    await promptSelection(
      `Add your number modulo 6.\n0 - 0\n1 - 1\n2 - 2\n3 - 3\n4 - 4\n5 - 5\nX - exit\n? - help\n> `,
      ["0", "1", "2", "3", "4", "5", "X", "?"]
    ),
    10
  );
  console.log(`My number is ${computerThrow2.randomInt} (KEY=${computerThrow2.key}).`);
  const result2 = (computerThrow2.randomInt + userInput2) % 6;
  console.log(`The result is ${computerThrow2.randomInt} + ${userInput2} = ${result2} (mod 6).`);
  const userResult2 = dice1[userInput2];
  console.log(`Your throw is ${userResult2}.`);

  if (userResult2 > computerResult1) {
    console.log(`You win (${userResult2} > ${computerResult1})!`);
  } else if (userResult2 < computerResult1) {
    console.log(`I win (${computerResult1} > ${userResult2})!`);
  } else {
    console.log(`It's a tie (${userResult2} = ${computerResult1})!`);
  }

  rl.close();
}

async function main() {
  console.log("Let's determine who makes the first move.");
  const firstMove = generateRandomNumber(1);
  console.log(
    `I selected a random value in the range 0..1 (HMAC=${firstMove.hmac}).`
  );

  const userGuess = await promptSelection(
    `Try to guess my selection.\n0 - 0\n1 - 1\nX - exit\n? - help\n> `,
    ["0", "1", "X", "?"]
  );

  if (userGuess === "X") {
    console.log("Exiting the game. Goodbye!");
    rl.close();
    return;
  } else if (userGuess === "?") {
    console.log("Help: Guess my number by entering 0 or 1. X exits the game.");
    rl.close();
    return;
  }

  const userWin = parseInt(userGuess, 10) === firstMove.randomInt;
  console.log(
    `My selection: ${firstMove.randomInt} (KEY=${firstMove.key}).`
  );
  console.log(userWin ? "You win the first move!" : "I make the first move!");

  const diceConfigs = [
    [2, 2, 4, 4, 9, 9],
    [6, 8, 1, 1, 8, 6],
    [7, 5, 3, 7, 5, 3],
  ];

  const computerDice = diceConfigs[1];
  const userDice = diceConfigs[0];

  await playDiceGame(userDice, computerDice);
}

main();
