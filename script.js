//TODO: Make responsive for tablet
//TODO: go landscape mode in tablet and portrait in phone.
//TODO: Implement double down;
//TODO: Implement betting pc;
//TODO: Implement chips for betting diferent quantities;
//TODO: Show tips when the game ends. E.G. Controls, strategies, dealer behaviour, time and games so far...
//TODO: Music and sound



//GLOBAL VARIABLES
let playerCards = [];
let dealerCards = [];
let deck = [];

let currentCardsPlayer = 0;
let currentCardsDealer = 0;

let bank = 100;
let bet = 0;
let betMemo = 0;
const prizeMult = 2;
const blackjackPrizeMult = 3;

let gameStarted = false;
let playerTurn = false;
let dealerTurn = false;
let phase ='';

let cardTimeout = 800;
let bigSignTimeout = 800;
let cardDealingTimeout = 200;

let keyboardTipCount = 0;
let blackjackTipCount = 0;

//UTILITIES
//Debounce functions
function debounce(fn, delay) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}
//Avoid right click
document.addEventListener('contextmenu', event => event.preventDefault());

//Turn right click on mobile to hold click
// $(document).ready(function () {
//   if($(window).width() < 600) {
//     document.addEventListener('contextmenu', event => event.preventDefault());
//    }
// })


//GAME FUNCTIONS

// Creating the deck
// Create the class Card with the card's rank and suit.
class Card {
    constructor(number, suit, value) {
        this._number = number;
        this._suit = suit;
        this._value = value;
    }

    get number() {
        return this._number;
    }

    get suit() {
        return this._suit;
    }

    get value() {
        return this._value;
    }
}

function createDeck() {

    deck = [];

    function createDeck(suit) {

        function createAce(suit) {
            let cardWord = 'card';
            let cardNumber = 1;
            let card = cardWord + cardNumber;
            card = new Card('A', suit, 11);
            deck.push(card)
        }

        function createFacedCards(suit) {
            let card = 'card' + 11;
            card = new Card('J', suit, 10);
            deck.push(card)
            card = 'card' + 12;
            card = new Card('Q', suit, 10);
            deck.push(card)
            card = 'card' + 13;
            card = new Card('K', suit, 10);
            deck.push(card)
        }

        function createRegularCards(suit) {
            for (let i = 2; i <= 10; i++) {
                let cardWord = 'card';
                let cardNumber = i;
                let card = cardWord + cardNumber;
                card = new Card(i, suit, i);
                deck.push(card)
            }
        }

        createAce(suit);
        createRegularCards(suit)
        createFacedCards(suit);

    }
    createDeck('hearts');
    createDeck('diamonds');
    createDeck('spades');
    createDeck('clubs');

}

/// Deal a card
function randomCard() {
    let selectedCard = Math.round((Math.random() * (deck.length - 1)));
    let dealedCard = deck[selectedCard];
    deck.splice((selectedCard), 1)
    return dealedCard;
}

// Get the sum of the values of one player cards.
function totalValue(player) {
    let result = 0;
    for (i = 0; i < player.length; i++) {
        result += player[i].value
    }
    return result;
}

//Check if player has an Ace.
function hasAnAce(playerCards) {
    let trueOrNot = false;
    for (i = 0; i < playerCards.length; i++)
        if (playerCards[i]._value == 11) {
            trueOrNot = true;
            break
        }
    return trueOrNot;
}

// Turn Ace value from eleven to one
function turnAceToOne(cardsWhereTheAceIs) {

    function findAce(cardToFind) {
        return cardToFind.value > 10;
    }

    let indexOfAce = cardsWhereTheAceIs.findIndex(findAce);
    cardsWhereTheAceIs[indexOfAce]._value = 1;
    // console.log("Total value over 21. The Ace value becomes 1.");
}

//Return number and suit of the card that has been dealt.
function describeDealtCard(dealtCard) {
    return dealtCard.number + " of " + dealtCard.suit
}

//Return the current value of the players cards.
function tellCurrentValue(playerCards) {
    return 'The cards add to ' + totalValue(playerCards) + ".";
}

//Returns a string with the hand of the player.
function currentHand(player) {
    let currentHand = '';
    for (i = 0; i < player.length; i++) {
        if (i == player.length - 2) {
            currentHand += describeDealtCard(player[i]);
            continue
        }
        if (i == player.length - 1) {
            currentHand += ' and '
            currentHand += describeDealtCard(player[i]);
            currentHand += '.';
            break;
        }
        currentHand += describeDealtCard(player[i]);
        currentHand += ', ';
    }
    return "current hand is: " + currentHand;
}

//FUNCTIONS FOR JQUERY

//Returns a string with the players card number and suit.
function showCardDOM(player, card) {
    let cardNumber = player[card - 1].number;
    let cardSuit = player[card - 1].suit;

    let output = cardNumber
    //+ ' ' + cardSuit;
    return output;
}

//Returns the img html code for the suit svg.
function turnSuitStringToSuitImg(player, card) {
    let cardSuit = player[card - 1].suit;
    if (cardSuit == 'hearts') {
        return '<img src="images/heart-poker-piece.svg">'
    } else if (cardSuit == 'diamonds') {
        return '<img src="images/diamond-poker-piece.svg">'
    } else if (cardSuit == 'clubs') {
        return '<img src="images/chip-with-club.svg">'
    } else if (cardSuit == 'spades') {
        return '<img src="images/spades-poker-piece.svg" >'
    }
};

//Appends new card in the DOM for player
function appendNewCardToPlayerHand(cardNumber) {

    let card = $('<li class="card undealed_player" id="player_card">' + turnSuitStringToSuitImg(playerCards, cardNumber) + '<h3>' + showCardDOM(playerCards, cardNumber) + '</h3></li>');

    return $('#player_hand').append(card) + appendCardPlayerAnimation();

}

//Appends new card in the DOM for dealer
function appendNewCardToDealerHand(cardNumber) {

    let card = $('<li class="card undealed_dealer" id="dealer_card">' + turnSuitStringToSuitImg(dealerCards, cardNumber) + '<h3>' + showCardDOM(dealerCards, cardNumber) + '</h3></li>');

    return $('#dealer_hand').append(card) + appendCardDealerAnimation();
}

//Animations
function appendCardPlayerAnimation() {
    return ';' + $('.undealed_player').animate({
            'bottom': '-1em',
            'opacity': 1
        }, 400) + ';' +
        $('.undealed_player').removeClass('undealed_player');
}

function appendCardDealerAnimation() {
    return ';' + $('.undealed_dealer').animate({
            'bottom': '-1em',
            'opacity': 1
        }, 400) + ';' +
        $('.undealed_dealer').removeClass('undealed_dealer');
}

//Betting
function increaseBet () {
  if (bank > 0) {
    bet += 5;
    bank -= 5;
  }
}

function decreaseBet () {
  if (bet > 5) {
    bet -= 5;
    bank += 5;
  }
}

function regularPrize () {
  bank += (bet * prizeMult);
  betMemo = bet;
  bet = 0;
}

function noPrize () {
  bank += bet;
  betMemo = bet;
  bet = 0;
}

function blackjackPrize () {
  bank += (bet * blackjackPrizeMult)
  betMemo = bet;
  bet = 0;
}

function losePrize () {
  betMemo = bet;
  bet = 0;
}


//HUD functions
function cleanUpForNewGame () {
  $('#player_score span').text('');
  $('#dealer_score span').text('');
  $('.card').remove();
  $('#tip').remove();
  playerCards = [];
  dealerCards = [];
  $('#big_event_message_holder').addClass('hidden');
  $('#double_down').addClass('hidden');
  $('#ace_becomes_one_player').addClass('hidden')
}

function refreshBetHUD () {
  $('#set_bank span').text(bank);
  $('#set_bet span').text(bet);
  $('#bet span').text(bet);
  $('#bank span').text(bank);
}

// Tips
const keyboardTips = [
  // '',
  'You can change your bet with the UP and DOWN arrows and set it by pressing ENTER',
  'You can use the RIGHT arrow to Hit and the LEFT arrow to Stand',
  'You can Double Down pressing "d"',
]

const blackjackTips = [
  // '',
  'Dealer draws cards until he has a total of 17 or more',
  'If your first two cards total 21 you win double prize',
  "Doubling down allows you to double your bet and receive one (and only one) additional card to your hand",
]

//TODO: tips! almost implemented.
// function showTips () {
//
//   function innerRandom () {
//     let tip = 'cac';
//     let keyboardTip = keyboardTips[keyboardTipCount];
//     let blackjackTip = blackjackTips[blackjackTipCount];
//
//     if (Math.random() > 0.5) {
//       if (keyboardTipCount < keyboardTips.length) {
//         keyboardTipCount++;
//         tip = keyboardTip;
//       }
//     } else {
//       if (blackjackTipCount < blackjackTips.length)
//       blackjackTipCount++;
//       tip = blackjackTip;
//     }
//
//         // $(document).ready(function () {
//     if($(window).width() < 600) {
//       alert('mobile')
//     } else {
//           // });
//       return $('#big_event_message_holder').append(`<h4 id='tip'>Tip: ${tip}</h4>`)
//
//     }
//   }
//
//   // if (Math.random() > 0.5)
//     return innerRandom();
//   //return innerRandom();
//
// }


//// ACTUAL GAME _______________________________________________________________________________________________________

$(document).ready(function () {

//The big sign appears when the DOM is ready.
$('#big_event_message_holder').removeClass('hidden');

function gameStart() {
  if (bank <= 0) {
    bankruptcy()
  } else {
    gameStarted = true;

    cleanUpForNewGame ();

    createDeck();

    setBet();
  }
}

function setBet() {
  let betSetted = false;
  $('#bet_wrapper').removeClass('hidden');
  $('#bet_buttons').removeClass('hidden');
  refreshBetHUD();

  $('#button_more_bet').on('click', function () {
    if (!betSetted) {
      increaseBet();
      refreshBetHUD();
    }
  });

  $(window).keydown(function (e) {
    if (!betSetted && e.which == 38) {
      increaseBet();
      refreshBetHUD();
    }
  });

  $('#button_less_bet').on('click', function () {
      if (!betSetted) {
        decreaseBet();
        refreshBetHUD();
      }
  });

  $(window).keydown(function (e) {
    if (!betSetted && e.which == 40) {
      decreaseBet();
      refreshBetHUD();
    }
  });

  $('#button_set_bet').on('click', function () {
    if (!betSetted) {
      $('#bet_wrapper').addClass('hidden');
      $('#bet_buttons').addClass('hidden');
      dealFirstCards();
    betSetted = true;
  }
  });

  $(window).keyup(function (e) {
    if (!betSetted && e.which == 13) {
      $('#bet_wrapper').addClass('hidden');
      $('#bet_buttons').addClass('hidden');
      dealFirstCards();
    betSetted = true;
  }
  });

}

function dealFirstCards () {

    //player is dealt two cards
    playerCards.push(randomCard(), randomCard());
    currentCardsPlayer = 2;


    //dealer is dealt two cards
    dealerCards.push(randomCard(), randomCard());
    currentCardsDealer = 2;

    showHUD();

    appendNewCardToPlayerHand(1);
    setTimeout(function () {return appendNewCardToPlayerHand(2);}, cardDealingTimeout)
    setTimeout(function () {return appendNewCardToDealerHand(1);}, cardDealingTimeout * 2)

    //For the flipped card
    var secondCardDealerFlipped = $('<li class="card flipped undealed_dealer" id="dealer_card"><h3></h3></li>');
    $('#dealer_hand').append(secondCardDealerFlipped);
    appendCardDealerAnimation();

    // console.log("The player is dealt a " + describeDealtCard(playerCards[0]) + " and a " + describeDealtCard(playerCards[1]) + ". " + tellCurrentValue(playerCards));

    // console.log("The dealer is dealt a " + describeDealtCard(dealerCards[0]) + " and a hidden card.")


    if (totalValue(playerCards) > 21 && hasAnAce(playerCards)) {
        turnAceToOne(playerCards);
        $('#ace_becomes_one_player').removeClass('hidden')
    }

    if (totalValue(playerCards) == 21)
    blackjackCheck();
    else {
      // console.log('Hit or stand?');
      playerTurn = true;
      phase = 'doubleDown';
    }
  }

  //HUD appears
  function showHUD () {
    $('#stand').removeClass('hidden');
    $('#hit').removeClass('hidden');
    $('#player_score span').text("" + totalValue(playerCards) + "");
    $('#dealer_score span').text("" + dealerCards[0].value + "");
    $('#player_score').removeClass('hidden');
    $('#dealer_score').removeClass('hidden');
    $('#bank').removeClass('hidden');
    $('#bet').removeClass('hidden');
    $('#double_down').removeClass('hidden');
}


//Player can choose to Stand, Double Down or Hit.

function doubleDown () {
  if (bet * 2 <= bank) {
    bank -= bet;
    bet *= 2;
    betMemo = bet;
  } else {
    bet += bank;
    bank = 0;
    betMemo = bet;
  }
  refreshBetHUD();

  $('#double_down').addClass('hidden');
  $('#ace_becomes_one_player').addClass('hidden');
  playerCards.push(randomCard());
  currentCardsPlayer++;
  appendNewCardToPlayerHand(currentCardsPlayer);

  if (totalValue(playerCards) > 21 && hasAnAce(playerCards)) {
      turnAceToOne(playerCards);
      $('#ace_becomes_one_player').removeClass('hidden')
  }
  // console.log(tellCurrentValue(playerCards));

  $('#player_score span').text("" + totalValue(playerCards) + "");

  //If the total value is over 21, player bust.

  if (totalValue(playerCards) > 21)
    {playerTurn = false;
      gameStarted = false;
      setTimeout(function () {
          playerBust();
      }, bigSignTimeout)}
  else if (totalValue(playerCards) == 21) {
      blackjackCheck();
  } else {
    setTimeout(function () {
      stand()
    }, bigSignTimeout);
  }
}

//If clicks Hit receives another card.
function hit() {
    $('#double_down').addClass('hidden');
    $('#ace_becomes_one_player').addClass('hidden');
    playerCards.push(randomCard());
    currentCardsPlayer++;
    // console.log("The player is dealt a " + describeDealtCard(playerCards[playerCards.length - 1]) + ".");
    // console.log("Player " + currentHand(playerCards));
    //If the hand is over 21 and it has an Ace, the Ace becomes value 1 instead of 11.

    appendNewCardToPlayerHand(currentCardsPlayer);



    if (totalValue(playerCards) > 21 && hasAnAce(playerCards)) {
        turnAceToOne(playerCards);
        $('#ace_becomes_one_player').removeClass('hidden')
    }
    // console.log(tellCurrentValue(playerCards));

    $('#player_score span').text("" + totalValue(playerCards) + "");

    //If the total value is over 21, player bust.

    if (totalValue(playerCards) > 21)
      {playerTurn = false;
        gameStarted = false;
        setTimeout(function () {
            playerBust();
        }, bigSignTimeout)}
    else {
        // console.log('Hit or stand?');
        playerTurn = true;
    }

}
//This can be repeated until the player goes over 21 or stands.


//If the player chooses to stand, the dealer reveals the hidden card.
function stand() {
    $('#ace_becomes_one_player').addClass('hidden');
        // $('#stand').addClass('hidden');
        // $('#hit').addClass('hidden');
    // console.log('Dealer flips his hidden card. It is a ' + describeDealtCard(dealerCards[1]) + ".");
$('.flipped').remove();
     appendNewCardToDealerHand(currentCardsDealer);
        $('#dealer_score span').text("" + totalValue(dealerCards) + "");

    dealersDecision()
}

/*Following the same logic as in the player turn, the dealer's hand and it's
total value is described. If it goes over 21 and has an Ace, the Ace will become
value 1 instead of 11.
*/
function dealersDecision() {
    // console.log('Dealer ' + currentHand(dealerCards));

    if (totalValue(dealerCards) > 21 && hasAnAce(dealerCards))
        turnAceToOne(dealerCards);
 $('#dealer_score span').text("" + totalValue(dealerCards) + "");
    // console.log(tellCurrentValue(dealerCards));

    /*Now the dealers decision. Dealer will take more cards until total value is 17 or more.
    After that, decideWinner() is activated. If the dealer's total han value goes over 21,
    the player wins*/

    if (totalValue(dealerCards) > 21)
        setTimeout(function(){dealerBust()}, bigSignTimeout);
    else if (totalValue(dealerCards) == 21)
        decideWinner();
    else if (totalValue(dealerCards) >= 17)
        decideWinner();
    else(dealerTakeACard())


}

function dealerTakeACard() {

    $('#dealer_score span').text("" + totalValue(dealerCards) + "");

    setTimeout(function () {
        dealerCards.push(randomCard());
        currentCardsDealer++;

        // console.log("The dealer is dealt a " + describeDealtCard(dealerCards[dealerCards.length - 1]) + ".");

        appendNewCardToDealerHand(currentCardsDealer);
    $('#dealer_score span').text("" + totalValue(dealerCards) + "");


        dealersDecision();
    }, cardTimeout)
}



//Final value check.
function decideWinner() {
    // console.log("The dealer stands. Final check: ")
    // console.log("Player " + currentHand(playerCards) + " " + tellCurrentValue(playerCards));
    // console.log("Dealer " + currentHand(dealerCards) + " " + tellCurrentValue(dealerCards));

    setTimeout(function () {
        if (totalValue(playerCards) > totalValue(dealerCards))
            youWin();
        else if (totalValue(playerCards) == totalValue(dealerCards))
            push();
        else youLose();
    }, bigSignTimeout)
}

/*When player has 21 points in the first two cards it's a blackjack.
 * So player wins as long as dealer doesn't have blackjack.
 * If both have blackjack it is a draw.
 */
function blackjackCheck() {
    // console.log("Player blackjack!")
    // console.log('Dealer flips his hidden card. It is a ' + describeDealtCard(dealerCards[1]) + ".")
    // console.log('Dealer ' + currentHand(dealerCards));

    if (totalValue(playerCards) > totalValue(dealerCards))
        setTimeout(function () {
            blackjack();
        }, bigSignTimeout)
    else if (totalValue(playerCards) == totalValue(dealerCards))
        setTimeout(function () {
            blackjackPush();
        }, bigSignTimeout)
}




//Diferent endings

function blackjack() {
    // console.log("Dealer doesn't have blackjack! You win!")
    // console.log('Play again?')
    blackjackPrize();
    gameStarted = false;
    $('#big_event_message_holder h1').text("Blackjack!");
    $('#big_event_message_holder h3').text('Awesome! Double prize!');
    $('#big_event_message_holder h2').text(`You won ${betMemo * blackjackPrizeMult - betMemo}$`);
    $('#big_event_message_holder').removeClass('hidden');
}

function blackjackPush() {
    noPrize();
    // console.log("Player blackjack and dealer blackjack. It's a draw.")
    // console.log('Play again?')
    gameStarted = false;
    $('#big_event_message_holder h1').text("Blackjack!");
    $('#big_event_message_holder h3').text('Unfortunately, the dealer also has Blackjack');
    $('#big_event_message_holder h2').text(`You recover your ${betMemo}$`);
    $('#big_event_message_holder').removeClass('hidden');
}

function playerBust() {
    losePrize();
    // console.log('Bust! Your cards are over 21. You lose!')
    // console.log('Play again?')
    gameStarted = false;
    $('#big_event_message_holder h1').text("Bust! You Lose!");
    $('#big_event_message_holder h3').text('Your cards are over 21');
    $('#big_event_message_holder h2').text(`You lose ${betMemo}$`);
    // showTips();
    $('#big_event_message_holder').removeClass('hidden');
}

function dealerBust() {
    regularPrize();
    // console.log('Dealer cards are over 21! You win!')
    // console.log('Play again?')
    gameStarted = false;
    $('#big_event_message_holder h1').text("You win!");
    $('#big_event_message_holder h3').text('Dealer cards are over 21');
    $('#big_event_message_holder h2').text(`You won ${betMemo * prizeMult - betMemo}$`);
    // showTips();
    $('#big_event_message_holder').removeClass('hidden');
}

function push() {
    noPrize();
    // console.log("Push! Player and dealer have the same score. It's a draw.")
    // console.log('Play again?')
    gameStarted = false;
    $('#big_event_message_holder h1').text("Push!");
    $('#big_event_message_holder h3').text('Player and dealer have the same score');
    $('#big_event_message_holder h2').text(`Your recover your ${betMemo}$`);
    $('#big_event_message_holder').removeClass('hidden');
}

function youWin() {
    regularPrize();
    // console.log('You win!')
    // console.log('Play again?')
    gameStarted = false;
    $('#big_event_message_holder h1').text("You win!");
    $('#big_event_message_holder h3').text("Your cards value is higher than dealers'");
    $('#big_event_message_holder h2').text(`You won ${betMemo * prizeMult - betMemo}$`);
    // showTips();
    $('#big_event_message_holder').removeClass('hidden');

}

function youLose() {
    losePrize();
    // console.log('You lose!')
    // console.log('Play again?')
    gameStarted = false;
    $('#big_event_message_holder h1').text("You lose!");
    $('#big_event_message_holder h3').text("Dealer cards value is higher than yours");
    $('#big_event_message_holder h2').text(`You lose ${betMemo}$`);
    // showTips();
    $('#big_event_message_holder').removeClass('hidden');
}

function bankruptcy() {
    // console.log('Bankruptcy! Get out of here! Bring more money next time!')
    gameStarted = true;
    $('#big_event_message_holder h1').text("Bankruptcy");
    $('#big_event_message_holder h3').text("Bring more money next time");
    $('#big_event_message_holder h2').text(`Get out of here!`);
    $('#big_event_message_holder').removeClass('hidden');
}


//Interaction
    //Click on the sign or anykey except arrows starts game gameStart().
    $('#big_event_message_holder').on('click', function(e) {
      if (!gameStarted) {
          gameStart();
      };
    });

    $(document).keyup(function(e) {
      if (!gameStarted && e.which != 13) {
          gameStart();
      };
    });

    //Click on hit button or right arrow to hit()
    $('#hit').on('click', function () {
        if (playerTurn == true && gameStarted) {
            playerTurn = false;
            hit()
        };
    });

    $(document).keyup(function (e) {
        if (playerTurn == true && gameStarted && e.which == 39) {
            playerTurn = false;
            hit();
              playerTurn = true;
        };
    });



    //Double down click or 'd'
    $('#double_down').on('click', function () {
        if (playerTurn == true && gameStarted && phase == 'doubleDown') {
            playerTurn = false;
            doubleDown()
            phase = '';
        };
    });

    $(document).keyup(function (e) {
        if (playerTurn == true && gameStarted && phase == 'doubleDown' && e.which == 68) {
            playerTurn = false;
            doubleDown();
              phase = '';
        };
    });

    //click on stand button or left arrow to stand()
    $('#stand').on('click', function () {
        if (playerTurn == true && gameStarted) {
            playerTurn = false;
            stand();}
    });

    $(document).keyup(function (e) {
        if (playerTurn == true && gameStarted == true && e.which == 37) {
            playerTurn = false;
            stand()
        };
    });

});
