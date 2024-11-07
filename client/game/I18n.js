/* ------------------------------------------ */
/* class I18n */
/* ------------------------------------------ */
var I18n = {
	
	en : {

		error_noname : "You need to name yourself!",
		error_illegal_value : "Please enter a value equal or larger than 0!",
		error_field_already_occupied : 'The field you selected is already occupied. Choose another!',
		error_field_is_not_occupied : 'The field you selected is not occupied. Choose another!',
		error_housetype_too_low : 'The field you selected has a too low house-type. Choose another!',
		error_no_card_selected : 'Continue without picking a card?',
		error_not_enough_money : 'You are bidding more money than you have. You need to pay 3% interest per Month! Do you want to continue?',

		"City Builder": 'City Builder',
		"A card based multi player board game": 'A card based multi player board game',
		"Your name": 'Your name',
		"You could create or join a game": 'You could create or join a game',
		"List available Games": 'List available Games',
		"Create Game": 'Create Game',
		msg_games_available: 'These games are currently in setup',
		msg_join_selected_game: 'Join selected game',
		msg_re_join_game: 'Re-Join Game',
		msg_nobody_at_the_moment: 'nobody at the moment',

		msg_wfp_title: 'Waiting for other players',
		msg_wfp_playtime: 'PlayTime',
		msg_wfp_rounds: 'rounds',
		msg_wfp_startgame: 'Start now!',
		msg_wfp_player_in_the_game: 'Players in the game',
		msg_wfp_wait: 'Wait...',

		button_play : 'Play',
		button_discard : 'Discard',
		button_cancel : 'Cancel Deploy',
		button_endRound : 'End Round',
		button_set_bidding : 'Set bidding',
		button_pick_card : 'Pick card',

		infoBar_cash : 'Cash',
		infoBar_playernum : 'Player#',
		infoBar_date : 'Date',
		infoBar_balances : 'Current balances:',
		infoBar_income_last_round : 'Income last round:',
		infoBar_last_bids : 'Bids last round:',
		infoBar_other_players : 'Other players',
		infoBar_switch_ui : 'Switch UI',

		infoField_type : 'Type',
		infoField_pos : 'Pos',
		infoField_buildState : 'Build-State',
		infoField_houseType : 'House-Type',
		infoField_housePop : 'House-Population',
		infoField_localLevel : 'Social-level',
		infoField_attachedCard : 'Attached-card',
		infoField_owner : 'Owner',		

		auctionPanel_title1 : 'These cards are available for auction: ',
		auctionPanel_title2 : 'Pick a card: ',
		auctionPanel_enter_bid : 'Enter how many Dollars you want to bid:',

		gameEnded_winner : 'Winner {0} with ${1}',
		gameEnded_list : ' got $',

		uiSwitchButtonText_mode: [ 'House types', 'Missing population', 'Restaurant influence', 'Groceries influence', 'Clothing influence', 'Jewelery influence', 'Electronics influence', 'Public Services inf.', 'Criminals' ],
		buildStateText: [ 'no build in progress', 'build in progress', 'build done' ],
		localLevelTextShort_0 : 'Under',
		localLevelTextShort_1 : 'LowerMidl',
		localLevelTextShort_2 : 'Middle',
		localLevelTextShort_3 : 'UpperMidl',
		localLevelTextShort_4 : 'Upper',
		localLevelText_0 : 'Under class',
		localLevelText_1 : 'Lower middle class',
		localLevelText_2 : 'Middle class',
		localLevelText_3 : 'Upper middle class',
		localLevelText_4 : 'Upper class',
		houseTypeText : [ '', 'Villa', 'Residence', 'Duplex house', 'Row house', 'Apartment Building', 'Simple Bungalow', 'Small Tower', 'Large Tower', 'Social', 'Ghetto Tower' ],
		houseTypeTextShort : [ '', 'Villa', 'Resid', 'Duplx', 'Rowh', 'Apatm', 'Bunga', 'Sm To', 'Lg To', 'Social', 'Ghetto'],
		fieldType : ['U', 'H', 'R', 'G', 'C', 'J', 'E', 'P', 'X'],
		fieldTypeLong : ['Occupied', 'House', 'Restaurant', 'Groceries', 'Clothing', 'Jewelery', 'Electronic', 'Public Services', 'Criminals'],

		c_all_housetypes : 'all building types',

		c0_1 : 'Italian Bistro',
		c0_2 : 'Build an "Italian Bistro" instead of any residential building.',

		c1_1 : 'Italian Restaurant',
		c1_2 : 'Build an "Italian Restaurant" instead of any residential building.',

		c2_1 : 'Fine Italian Dining',
		c2_2 : 'Build a "Fine Italian Restaurant" instead of any residential building.',

		c3_1 : 'Greek Restaurant',
		c3_2 : 'Build a "Greek Restaurant" instead of any residential building.',

		c4_1 : 'Chinese Fast Food',
		c4_2 : 'Build a "Chinese Fast Food" instead of any residential building.',

		c5_1 : 'Mongolian Grill',
		c5_2 : 'Build a "Mongolian Grill" instead of any residential building.',

		c6_1 : 'Steakhouse',
		c6_2 : 'Build a "Steakhouse" instead of any residential building.',

		c7_1 : 'Haute Cuisine',
		c7_2 : 'Build a "Haute Cuisine Restaurant" instead of any residential building.',

		c8_1 : 'McDonalds',
		c8_2 : 'Build a "McDonalds Restaurant" instead of any residential building.',

		c9_1 : 'Burger King',
		c9_2 : 'Build a "Burger King Restaurant" instead of any residential building.',

		c10_1 : 'KFC',
		c10_2 : 'Build a "KFC Restaurant" instead of any residential building.',

		c100_1 : 'Vegetable Store',
		c100_2 : 'Build a "Vegetable Store" instead of any residential building.',

		c101_1 : 'Aldi',
		c101_2 : 'Build an "Aldi" instead of any residential building.',

		c102_1 : 'Dollar General',
		c102_2 : 'Build a "Dollar General Market" instead of any residential building.',

		c103_1 : 'Trader Joe\'s',
		c103_2 : 'Build a "Trader Joe\'s" instead of any residential building.',

		c104_1 : 'Walmart',
		c104_2 : 'Build a "Walmart Store" instead of any residential building.',

		c105_1 : 'Whole Foods Market',
		c105_2 : 'Build a "Whole Foods Market" instead of any residential building.',

		c106_1 : 'Sprouts Farmers Market',
		c106_2 : 'Build a "Sprouts Farmers Market" instead of any residential building.',

		c200_1 : 'Ross',
		c200_2 : 'Build a "Ross Clothing Market" instead of any residential building.',

		c201_1 : 'Target',
		c201_2 : 'Build an "Target Clothing Market" instead of any residential building.',

		c202_1 : 'Nordstrom',
		c202_2 : 'Build a "Nordstrom Clothing Market" instead of any residential building.',

		c203_1 : 'H&M',
		c203_2 : 'Build an "H&M Clothing Store" instead of any residential building.',

		c204_1 : 'Dolce & Gabbana',
		c204_2 : 'Build a "Dolce & Gabbana Clothing Store" instead of any residential building.',

		c205_1 : 'Chanel',
		c205_2 : 'Build a "Chanel Boutique" instead of any residential building.',

		c206_1 : 'Macy\s',
		c206_2 : 'Build an "Macy\s Clothing Store" instead of any residential building.',

		c207_1 : 'Gap',
		c207_2 : 'Build a "Gap Clothing Store" instead of any residential building.',

		c208_1 : 'Abercrombie & Fitch',
		c208_2 : 'Build an "Abercrombie & Fitch" instead of any residential building.',

		c300_1 : 'Claire\'s',
		c300_2 : 'Build a "Claire\'s" instead of any residential building.',

		c301_1 : 'Jeweler',
		c301_2 : 'Build a "Jeweler" instead of any residential building.',

		c302_1 : 'Tiffany & Co',
		c302_2 : 'Build a "Tiffany & Co" instead of any residential building.',

		c400_1 : 'TV & Hi-Fi',
		c400_2 : 'Build a "TV & Hi-Fi Store" instead of any residential building.',

		c401_1 : 'Electronics Market',
		c401_2 : 'Build an "Electronics Market" instead of any residential building.',

		c500_1 : 'Gentrification',
		c500_2 : 'Select a residential building to be gentrified.',

		c501_1 : 'Population Growth',
		c501_2 : 'Select a residential building to receive additional population.',

		c502_1 : 'City Expansion',
		c502_2 : 'The city expands by 3x3 blocks.',

		c503_1 : 'City Expansion',
		c503_2 : 'The city expands by 3x3 blocks.',

		c504_1 : 'City Expansion',
		c504_2 : 'The city expands by 3x3 blocks.',

		c505_1 : 'Relocation',
		c505_2 : 'Select a residential building where people should move. They may build a different house type.',

		c600_1 : 'Police Station',
		c600_2 : 'Build a "Police Station" instead of any residential building.',

		c601_1 : 'Hospital',
		c601_2 : 'Build a "Hospital" instead of any residential building.',

		c602_1 : 'Fire Station',
		c602_2 : 'Build a "Fire Station" instead of any residential building.',

		c700_1 : 'Cooking Fun',
		c700_2 : 'People are excited about cooking again. Choose a restaurant and remove it.',

		c701_1 : 'Clothing Bankruptcy',
		c701_2 : 'People can\'t afford clothes. Choose a clothing store and remove it.',

		c702_1 : 'Supermarket Bankruptcy',
		c702_2 : 'People stop shopping. Choose a supermarket and remove it.',

		c703_1 : 'No Diamonds',
		c703_2 : 'People stop buying diamonds. Choose a jeweler and remove it.',

		c704_1 : 'Electronics Market Bankruptcy',
		c704_2 : 'People stop buying electronics. Choose an electronics market and remove it.',

		c705_1 : 'Public Budget Deficit',
		c705_2 : 'No money in the public budget. Choose a police station, fire station, or hospital and remove it.',

		c800_1 : 'Dealer on Playground',
		c800_2 : 'A residential lot of your choice becomes a drug dealer hotspot. Can only be played on a {9,10} residential lot.',

		c801_1 : 'Massage Parlor',
		c801_2 : 'A Massage Parlor opens in a residential lot of your choice. Can only be played on a {7,10} residential lot.',

		c802_1 : 'High-Class Escort Place',
		c802_2 : 'A high-class Escort Place opens in a residential lot of your choice. Can only be played on a {1,4} residential lot.',

		help_0 : 'Here you can find information how the game works.<br/><br/>This is a multi-player computer-based card game.<br/><br/>You can either join a game somebody else created or create a game by yourself. Either way you have to put your name into the text field.',
		help_1 : 'You created a new game.<br/><br/>Now wait for other players to join the game. If another player joined the game, his/her name will be added to the section `Players in the game`. When all players are listed there you have to press `Start Now`.<br/><br/>Even you can start a game with only you as a player, this doesn`t make much sense. So you should make sure that at least 2 players are in the game.<br/><br/>You can also defined how many rounds (also called months) this game should have. 12 months are a good starting point. A game with 12 months should take ~20-30 minutes.',
		help_2 : 'You requested the list of games currently in the `Waiting for other players` state.<br/><br/>If nothing changed no game is available.<br/><br/>If games to join are available you will see them in the drop down box under the section `These games are currently in setup`. After you put your name in the text field select one and click `Join selected game`',
		help_3 : 'You joined a game.<br/><br/>Now wait for other players to join the game. If another player joined the game, his/her name will be added to the section `Players in the game`. The game initiator can press `Start Now` at any time.<br/><br/>You have to wait now.',
		help_4 : 'The game is about building businesses in a city full of homes.<br/><br/>Each business opportunity is represented by a card. 4 of theses cards are offered to you. You have to pick one as the first business you will build.<br/><br/>Information on a card: Top left you find the name, top right the category. Bottom right is the influence range, bottom left the social level modificator. In the center you find the profit per month. Since all starting homes are a `Simple Bungalow` you should pick the card with the highest profit for that type, but keep in mind that a range of 1 equals to 8 homes, range 2 to 20 and range 3 to 44 homes.',		
		help_5 : 'This is the main board view. In the middle you see the city. Currently the city is made up of 9 blocks. Each block has 8 homes and an inner courtyard.<br/><br/>`Bunga` says that the Home is a Simple Bungalow, the number in each home defines how many people are living there. A Simple Bungalow can have 1 to 4 people.<br/><br/>Now you have to play your card. Click `Play` at the top of the card and select a home on the city board where to build your business. With the colored range display you can see which homes will contribute to the profit of your new business.<br/><br/>If you have settled your business, click `End Round` at the right bottom.',
		help_6 : 'Bidding phase.<br/><br/>All players get these cards offered. You have to bid on your place in the picking sequence.<br/><br/>If you don´t care which card you get, put 0 into the text field on the right bottom. You can also bid more money than you currently have (that means you loan the difference for 3% interest per month)', 
		help_7 : 'Card picking phase.<br/><br/>Depending on the outcome of the auction you go first or have to wait for other players.<br/><br/>When it is your turn, pick one card and click `Pick Card`.', 
	}	
}

I18n.de = I18n.en;