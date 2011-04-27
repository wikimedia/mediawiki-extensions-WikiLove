CREATE TABLE IF NOT EXISTS /*$wgDBprefix*/wikilove_log (
	`wl_id` int NOT NULL PRIMARY KEY auto_increment,
	`wl_timestamp` char(14) NOT NULL,
	`wl_sender_id` int(11) NOT NULL,
	`wl_receiver_id` int(11) NOT NULL,
	`wl_wiki` varchar(64) NOT NULL,
	`wl_type` varchar(64) NOT NULL,
	`wl_template` varchar(64) NOT NULL,
	`wl_message` varchar(255) NOT NULL,
	`wl_email` bool NOT NULL default '0'
) /*$wgDBTableOptions*/;
