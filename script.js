//TODO: Make responsive for tablet
//TODO: go landscape mode in tablet and portrait in phone.
//TODO: Implement betting https://www.blackjackinfo.com/blackjack-rules/
//TODO: Show tips when the game ends. E.G. Controls, strategies, dealer behaviour, time and games so far...
//TODO: Music and sound

$(document).ready(function () {

//GLOBAL VARIABLES
let playerCards = [];
let dealerCards = [];
let deck = [];

let currentCardsPlayer = 0;
let currentCardsDealer = 0;

let playerMoney = 100;
let bet = 0;

let gameStarted = false;
let playerTurn = false;
let dealerTurn = false;

let cardTimeout = 800;
let bigSignTimeout = 800;
let autofireTimeout = 500;

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

//Avoid autorepeated key fire
//TODO:THIS IS NOT WORKING, STILL AUTOFIRES
var allowed = true;

$(document).keydown(function(event) {
  if (event.repeat != undefined) {
    allowed = !event.repeat;
  }
  if (!allowed) return;
  allowed = false;
  //...
});

$(document).keyup(function(e) {
  allowed = true;
});
$(document).focus(function(e) {
  allowed = true;
});

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

    /*
      createAce('diamonds');

      for (let i = 2; i <= 9; i++) {
        let cardWord = 'card';
        let cardNumber = i;
        let card = cardWord + cardNumber;
        card = new Card(i, 'diamonds', i);
        deck.push(card)
      }

      for (let i = 10; i <= 13; i++) {
        let cardWord = 'card';
        let cardNumber = i;
        let card = cardWord + cardNumber;
        card = new Card(i, 'diamonds', 10);
        deck.push(card)
      }

      createAce('spades');

      for (let i = 2; i <= 9; i++) {
        let cardWord = 'card';
        let cardNumber = i;
        let card = cardWord + cardNumber;
        card = new Card(i, 'spades', i);
        deck.push(card)
      }

      for (let i = 10; i <= 13; i++) {
        let cardWord = 'card';
        let cardNumber = i;
        let card = cardWord + cardNumber;
        card = new Card(i, 'spades', 10);
        deck.push(card)
      }

      createAce('clubs');

      for (let i = 2; i <= 9; i++) {
        let cardWord = 'card';
        let cardNumber = i;
        let card = cardWord + cardNumber;
        card = new Card(i, 'clubs', i);
        deck.push(card)
      }

      for (let i = 10; i <= 13; i++) {
        let cardWord = 'card';
        let cardNumber = i;
        let card = cardWord + cardNumber;
        card = new Card(i, 'clubs', 10);
        deck.push(card)
      }
    */
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
    console.log("Total value over 21. The Ace value becomes 1.");
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

//function appendBet

//// ACTUAL GAME

//The big sign appears when the DOM is ready.
$('#big_event_message_holder').toggleClass('hidden');

function gameStart() {
  gameStarted = true;

  $('.card').remove();
  $('#big_event_message_holder').toggleClass('hidden');

    playerCards = [];
    dealerCards = [];
    createDeck();




    //player is dealt two cards
    playerCards.push(randomCard(), randomCard());
    currentCardsPlayer = 2;


    //dealer is dealt two cards
    dealerCards.push(randomCard(), randomCard());
    currentCardsDealer = 2;

    appendNewCardToPlayerHand(1);
    appendNewCardToPlayerHand(2);
    appendNewCardToDealerHand(1);

    //HUD appears
    $('#stand').removeClass('hidden');
    $('#hit').removeClass('hidden');
    $('#player_score span').text("" + totalValue(playerCards) + "");
    $('#dealer_score span').text("" + dealerCards[0].value + "");
    $('#player_score').removeClass('hidden');
    $('#dealer_score').removeClass('hidden');

    //For the flipped card
    var secondCardDealerFlipped = $('<li class="card flipped undealed_dealer" id="dealer_card"><h3></h3></li>');
    $('#dealer_hand').append(secondCardDealerFlipped);
    appendCardDealerAnimation();

    console.log("The player is dealt a " + describeDealtCard(playerCards[0]) + " and a " + describeDealtCard(playerCards[1]) + ". " + tellCurrentValue(playerCards));

    console.log("The dealer is dealt a " + describeDealtCard(dealerCards[0]) + " and a hidden card.")


    if (totalValue(playerCards) > 21 && hasAnAce(playerCards)) {
        turnAceToOne(playerCards);
    }


    if (totalValue(playerCards) == 21)
        blackjackCheck();
    else {
        console.log('Hit or stand?');
        playerTurn = true;
    }

}

//Player can choose to click HIT or click STAND

//If clicks Hit receives another card.
function hit() {
    $('#ace_becomes_one_player').addClass('hidden');
    playerCards.push(randomCard());
    currentCardsPlayer++;
    console.log("The player is dealt a " + describeDealtCard(playerCards[playerCards.length - 1]) + ".");
    console.log("Player " + currentHand(playerCards));
    //If the hand is over 21 and it has an Ace, the Ace becomes value 1 instead of 11.

    appendNewCardToPlayerHand(currentCardsPlayer);



    if (totalValue(playerCards) > 21 && hasAnAce(playerCards)) {
        turnAceToOne(playerCards);
        $('#ace_becomes_one_player').removeClass('hidden')
    }
    console.log(tellCurrentValue(playerCards));

    $('#player_score span').text("" + totalValue(playerCards) + "");

    //If the total value is over 21, player bust.

    if (totalValue(playerCards) > 21)
      {playerTurn = false;
        setTimeout(function () {
            playerBust();
        }, bigSignTimeout)}
    else {
        console.log('Hit or stand?');
        playerTurn = true;
    }

}
//This can be repeated until the player goes over 21 or stands.


//If the player chooses to stand, the dealer reveals the hidden card.
function stand() {
    $('#ace_becomes_one_player').addClass('hidden');
        // $('#stand').addClass('hidden');
        // $('#hit').addClass('hidden');
    console.log('Dealer flips his hidden card. It is a ' + describeDealtCard(dealerCards[1]) + ".");
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
    console.log('Dealer ' + currentHand(dealerCards));

    if (totalValue(dealerCards) > 21 && hasAnAce(dealerCards))
        turnAceToOne(dealerCards);
 $('#dealer_score span').text("" + totalValue(dealerCards) + "");
    console.log(tellCurrentValue(dealerCards));

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

        console.log("The dealer is dealt a " + describeDealtCard(dealerCards[dealerCards.length - 1]) + ".");

        appendNewCardToDealerHand(currentCardsDealer);
    $('#dealer_score span').text("" + totalValue(dealerCards) + "");


        dealersDecision();
    }, cardTimeout)
}



//Final value check.
function decideWinner() {
    console.log("The dealer stands. Final check: ")
    console.log("Player " + currentHand(playerCards) + " " + tellCurrentValue(playerCards));
    console.log("Dealer " + currentHand(dealerCards) + " " + tellCurrentValue(dealerCards));

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
    console.log("Player blackjack!")
    console.log('Dealer flips his hidden card. It is a ' + describeDealtCard(dealerCards[1]) + ".")
    console.log('Dealer ' + currentHand(dealerCards));

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
    console.log("Dealer doesn't have blackjack! You win!")
    console.log('Play again?')
    gameStarted = false;
    $('#big_event_message_holder h1').text("Blackjack!");
    $('#big_event_message_holder h3').text('Awesome! Play again?');
    $('#big_event_message_holder h2').text('');
    $('#big_event_message_holder').toggleClass('hidden');
}

function blackjackPush() {
    console.log("Player blackjack and dealer blackjack. It's a draw.")
    console.log('Play again?')
    gameStarted = false;
    $('#big_event_message_holder h1').text("Blackjack!");
    $('#big_event_message_holder h3').text('Unfortunately, the dealer also has Blackjack');
    $('#big_event_message_holder h2').text("It's a draw");
    $('#big_event_message_holder').toggleClass('hidden');
}

function playerBust() {
    console.log('Bust! Your cards are over 21. You lose!')
    console.log('Play again?')
    gameStarted = false;
    $('#big_event_message_holder h1').text("Bust! You Lose!");
    $('#big_event_message_holder h3').text('Your cards are over 21');
    $('#big_event_message_holder h2').text('Play again?');
    $('#big_event_message_holder').toggleClass('hidden');
}

function dealerBust() {
    console.log('Dealer cards are over 21! You win!')
    console.log('Play again?')
    gameStarted = false;
    $('#big_event_message_holder h1').text("You win!");
    $('#big_event_message_holder h3').text('Dealer cards are over 21');
    $('#big_event_message_holder h2').text("Play again?");
    $('#big_event_message_holder').toggleClass('hidden');
}

function push() {
    console.log("Push! Player and dealer have the same score. It's a draw.")
    console.log('Play again?')
    gameStarted = false;
    $('#big_event_message_holder h1').text("Push!");
    $('#big_event_message_holder h3').text('Player and dealer have the same score');
    $('#big_event_message_holder h2').text("It's a draw");
    $('#big_event_message_holder').toggleClass('hidden');
}

function youWin() {
    console.log('You win!')
    console.log('Play again?')
    gameStarted = false;
    $('#big_event_message_holder h1').text("You win!");
    $('#big_event_message_holder h3').text("Your cards value is higher than dealers'");
    $('#big_event_message_holder h2').text("Play again?");
    $('#big_event_message_holder').toggleClass('hidden');

}

function youLose() {
    console.log('You lose!')
    console.log('Play again?')
    gameStarted = false;
    $('#big_event_message_holder h1').text("You lose!");
    $('#big_event_message_holder h3').text("Dealer cards value is higher than yours");
    $('#big_event_message_holder h2').text("Play again?");
    $('#big_event_message_holder').toggleClass('hidden');
}


//Interaction
    //Click or anykey except arrows starts game gameStart().
    $(document).on('click', function(e) {
      if (!gameStarted) {
          gameStart();
      };
    });

    $(document).keyup(function(e) {
      if (!gameStarted && e.which != 39 && e.which != 37 && e.which != 38 && e.which != 40) {
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
            setTimeout(function () {
              playerTurn = true;
            }, autofireTimeout)
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
