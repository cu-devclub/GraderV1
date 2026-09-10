CREATE TABLE IF NOT EXISTS `addfile` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `LID` int NOT NULL,
  `Path` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `CSYID` int NOT NULL,
  `Hide` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UNQ_AFS` (`LID`,`Path`,`CSYID`)
) ENGINE=InnoDB AUTO_INCREMENT=1062 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `checkout` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `UID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `LID` int NOT NULL,
  `CSYID` int NOT NULL,
  `ip` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `UID` (`UID`,`LID`,`CSYID`,`ip`)
) ENGINE=InnoDB AUTO_INCREMENT=2702 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `class` (
  `CSYID` int NOT NULL AUTO_INCREMENT,
  `ClassName` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ClassID` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SchoolYear` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Thumbnail` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ClassCreator` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Archive` tinyint(1) NOT NULL DEFAULT '0',
  `useGroup` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`CSYID`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `classeditor` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `CSYID` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UNQ_CET` (`Email`,`CSYID`)
) ENGINE=InnoDB AUTO_INCREMENT=247 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `download` (
  `Token` int NOT NULL,
  `Ip` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `CSYID` int NOT NULL,
  PRIMARY KEY (`Token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `exampin` (
  `LID` int NOT NULL,
  `Pin` char(6) COLLATE utf8mb4_general_ci NOT NULL,
  `Timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`LID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `group` (
  `GID` int NOT NULL AUTO_INCREMENT,
  `CSYID` int DEFAULT NULL,
  `Group` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`GID`),
  UNIQUE KEY `UNQ_Section` (`CSYID`,`Group`)
) ENGINE=InnoDB AUTO_INCREMENT=161 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `iplog` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `IP` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `UID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=228312 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `lab` (
  `LID` int NOT NULL AUTO_INCREMENT,
  `Lab` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Publish` datetime DEFAULT NULL,
  `Due` datetime DEFAULT NULL,
  `Lock` datetime DEFAULT NULL,
  `showScoreOnLock` tinyint(1) NOT NULL DEFAULT '0',
  `Exam` tinyint NOT NULL DEFAULT '0',
  `CID` json DEFAULT NULL,
  `GID` json DEFAULT NULL,
  `CSYID` int NOT NULL,
  `Creator` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `pin` char(6) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`LID`)
) ENGINE=InnoDB AUTO_INCREMENT=440 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `pinattempt` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `LID` int NOT NULL,
  `UID` char(10) COLLATE utf8mb4_general_ci NOT NULL,
  `Attempt` int NOT NULL,
  `IP` varchar(15) COLLATE utf8mb4_general_ci NOT NULL,
  `Timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UNQ_PAT` (`LID`,`UID`,`IP`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `question` (
  `QID` int NOT NULL AUTO_INCREMENT,
  `LID` int NOT NULL,
  `SourcePath` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `ReleasePath` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `MaxScore` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `LastEdit` datetime NOT NULL,
  `CSYID` int NOT NULL,
  `Qinfo` longtext COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`QID`)
) ENGINE=InnoDB AUTO_INCREMENT=1347 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `section` (
  `CID` int NOT NULL AUTO_INCREMENT,
  `CSYID` int DEFAULT NULL,
  `Section` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`CID`),
  UNIQUE KEY `UNQ_Section` (`CSYID`,`Section`)
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `student` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `CID` int NOT NULL,
  `UID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `CSYID` int NOT NULL,
  `GID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UNQ_Std` (`UID`,`CSYID`)
) ENGINE=InnoDB AUTO_INCREMENT=4479 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `submitted` (
  `SID` int NOT NULL AUTO_INCREMENT,
  `UID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `LID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `QID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `SummitedFile` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Score` float DEFAULT NULL,
  `Timestamp` datetime DEFAULT NULL,
  `CSYID` int NOT NULL,
  `OriginalName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`SID`),
  UNIQUE KEY `UNQ_SMD` (`QID`,`UID`)
) ENGINE=InnoDB AUTO_INCREMENT=197363 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `suspicious` (
  `SID` int NOT NULL AUTO_INCREMENT,
  `UID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `LID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `QID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Type` int NOT NULL,
  `Message` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`SID`),
  UNIQUE KEY `UNQ_SUS` (`QID`,`UID`,`Type`)
) ENGINE=InnoDB AUTO_INCREMENT=6217 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `ticket` (
  `ID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `UID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `LID` int NOT NULL,
  `CSYID` int NOT NULL,
  `Type` tinyint NOT NULL,
  `ip` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UNQ_TKT` (`UID`,`LID`,`CSYID`,`Type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `user` (
  `Email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `UID` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Role` varchar(1) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
