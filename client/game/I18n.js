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

		c_all_housetypes : 'alle Haustypen',

		c0_1 : 'Italienisches Bistro',
		c0_2 : 'Baue ein "Italienisches Bistro" anstelle eines beliebigen Wohnhauses.',

		c1_1 : 'Italienisches Restaurant',
		c1_2 : 'Baue ein "Italienisches Restaurant" anstelle eines beliebigen Wohnhauses.',

		c2_1 : 'Nobel Italiener',
		c2_2 : 'Baue ein "Italienisches Nobelrestaurant" anstelle eines beliebigen Wohnhauses.',

		c3_1 : 'Griechisches Restaurant',
		c3_2 : 'Bau ein "Griechisches Restaurant" anstelle eines beliebigen Wohnhauses,',

		c4_1 : 'Chinesischer Schnellimbiss',
		c4_2 : 'Baue einen "Chinesischen Schnellimbiss" anstelle eines beliebigen Wohnhauses.',

		c5_1 : 'Mongolischer Grill',
		c5_2 : 'Baue einen "Mongolischen Grill" anstelle eines beliebigen Wohnhauses.',

		c6_1 : 'Steakhaus',
		c6_2 : 'Baue ein "Steakhaus" anstelle eines beliebigen Wohnhauses.',

		c7_1 : 'Haute cuisine',
		c7_2 : 'Baue ein "Haute cuisine Restaurant" anstelle eines beliebigen Wohnhauses.',

		c8_1 : 'McDonalds',
		c8_2 : 'Baue ein "McDonalds Restaurant" anstelle eines beliebigen Wohnhauses.',

		c9_1 : 'Burger King',
		c9_2 : 'Baue ein "Burger King Restaurant" anstelle eines beliebigen Wohnhauses.',

		c10_1 : 'KFC',
		c10_2 : 'Baue ein "KFC Restaurant" anstelle eines beliebigen Wohnhauses.',

		c100_1 : 'Gemüseladen',
		c100_2 : 'Baue einen "Gemüseladen" anstelle eines beliebigen Wohnhauses.',

		c101_1 : 'Aldi',
		c101_2 : 'Baue einen "Aldi" anstelle eines beliebigen Wohnhauses.',

		c102_1 : 'Netto',
		c102_2 : 'Baue einen "Netto Markt" anstelle eines beliebigen Wohnhauses.',

		c103_1 : 'Lidl',
		c103_2 : 'Baue einen "Lidl" anstelle eines beliebigen Wohnhauses.',

		c104_1 : 'Real Super Store',
		c104_2 : 'Baue einen "Real Super Store" anstelle eines beliebigen Wohnhauses.',

		c105_1 : 'Reformhaus',
		c105_2 : 'Baue ein "Reformhaus" anstelle eines beliebigen Wohnhauses.',

		c106_1 : 'Tegut',
		c106_2 : 'Baue einen "Tegut Markt" anstelle eines beliebigen Wohnhauses.',
	
		c200_1 : 'Kik',
		c200_2 : 'Baue einen "Kik Kleidermarkt" anstelle eines beliebigen Wohnhauses.',

		c201_1 : 'Adler',
		c201_2 : 'Baue einen "Adler Kleidermarkt" anstelle eines beliebigen Wohnhauses.',

		c202_1 : 'C&A',
		c202_2 : 'Baue einen "C&A Kleidermarkt" anstelle eines beliebigen Wohnhauses.',

		c203_1 : 'H&M',
		c203_2 : 'Baue einen "H&M Kleidergeschäft" anstelle eines beliebigen Wohnhauses.',

		c204_1 : 'D&G',
		c204_2 : 'Baue einen "D&G Kleidergeschäft" anstelle eines beliebigen Wohnhauses.',

		c205_1 : 'Chanel',
		c205_2 : 'Baue ein "Chanel Boutique" anstelle eines beliebigen Wohnhauses.',

		c206_1 : 'Ulla Popken',
		c206_2 : 'Baue einen "Ulla Popken Kleidergeschäft" anstelle eines beliebigen Wohnhauses.',

		c207_1 : 'Breuninger',
		c207_2 : 'Baue einen "Breuninger Kleidergeschäft" anstelle eines beliebigen Wohnhauses.',

		c208_1 : 'Abercrombie & Fitch',
		c208_2 : 'Baue einen "Abercrombie & Fitch" anstelle eines beliebigen Wohnhauses.',

		c300_1 : 'Bijou Brigitte',
		c300_2 : 'Baue einen "Bijou Brigitte" anstelle eines beliebigen Wohnhauses.',

		c301_1 : 'Juwelier',
		c301_2 : 'Baue einen "Juwelier" anstelle eines beliebigen Wohnhauses.',

		c302_1 : 'Tiffany & Co',
		c302_2 : 'Baue einen "Tiffany & Co" anstelle eines beliebigen Wohnhauses.',

		c400_1 : 'TV & Hifi',
		c400_2 : 'Baue einen "TV & Hifi - Laden" anstelle eines beliebigen Wohnhauses.',

		c401_1 : 'Elektronikmarkt',
		c401_2 : 'Baue einen "Elektronikmarkt" anstelle eines beliebigen Wohnhauses.',

		c500_1 : 'Gentrifizierung',
		c500_2 : 'Wähle ein Wohnhaus das gentrifiziert werden soll.',

		c501_1 : 'Bevölkerungszuwachs',
		c501_2 : 'Wähle ein Wohnhaus das mehr Bevökerung bekommen soll.',

		c502_1 : 'Stadtwachsum',
		c502_2 : 'Die Stadt wächst um 3x3 Blöcke.',

		c503_1 : 'Stadtwachsum',
		c503_2 : 'Die Stadt wächst um 3x3 Blöcke.',

		c504_1 : 'Stadtwachsum',
		c504_2 : 'Die Stadt wächst um 3x3 Blöcke.',

		c505_1 : 'Umzug',
		c505_2 : 'Wähle ein Wohnhaus in dem Leute umziehen sollen. Manchmal bauen Sie auch einen anderen Haustypen.',

		c600_1 : 'Polizeistation',
		c600_2 : 'Baue eine "Polizeistation" anstelle eines beliebigen Wohnhauses.',

		c601_1 : 'Krankenhaus',
		c601_2 : 'Baue eine "Krankenhaus" anstelle eines beliebigen Wohnhauses.',

		c602_1 : 'Feuerwehrstation',
		c602_2 : 'Baue eine "Feuerwehrstation" anstelle eines beliebigen Wohnhauses.',

		c700_1 : 'Spaß am Kochen',
		c700_2 : 'Die Leute haben wieder Spaß am Kochen. Wähle ein Restaurant und entferne es.',

		c701_1 : 'Kleiderpleite',
		c701_2 : 'Die Leute haben kein Geld mehr für Kleider. Wähle ein Kleidergeschäft und entferne es.',

		c702_1 : 'Supermarktpleite',
		c702_2 : 'Die Leute kaufen nichts mehr. Wähle einen Supermarkt und entferne ihn.',

		c703_1 : 'No diamonds',
		c703_2 : 'Die Leute kaufen keine Diamanten mehr. Wähle einen Juwelier und entferne ihn.',

		c704_1 : 'Elektronikmarktpleite',
		c704_2 : 'Die Leute kaufen keine Elektronikprodukte mehr. Wähle einen Elektronikmarkt und entferne ihn.',

		c705_1 : 'Haushaltsdefizit',
		c705_2 : 'Kein Geld im öffentlichen Haushalt. Wähle ein Polizeitrevier, Feuerwehrstation oder Krankenhaus und entferne es.',

		c800_1 : 'Dealer auf dem Spielplatz',
		c800_2 : 'Einem Wohnfeld deiner Wahl wird zum Umschlagsplatz für Drogendealer. Kann nur auf ein {9,10} Wohnfeld gespielt werden.',

		c801_1 : 'Bordell',
		c801_2 : 'In einem Wohnfeld deiner Wahl wird ein Bordell eröffnet. Kann nur auf ein {7,10} Wohnfeld gespielt werden.',

		c802_1 : 'Edel Bordell',
		c802_2 : 'In einem Wohnfeld deiner Wahl wird ein Edel Bordell eröffnet. Kann nur auf ein {1,4} Wohnfeld gespielt werden.',

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