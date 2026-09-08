-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: sci.cugrader.com    Database: grader_prod
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addfile`
--

DROP TABLE IF EXISTS `addfile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addfile` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `LID` int NOT NULL,
  `Path` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `CSYID` int NOT NULL,
  `Hide` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UNQ_AFS` (`LID`,`Path`,`CSYID`)
) ENGINE=InnoDB AUTO_INCREMENT=1062 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `checkout`
--

DROP TABLE IF EXISTS `checkout`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checkout` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `UID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `LID` int NOT NULL,
  `CSYID` int NOT NULL,
  `ip` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `UID` (`UID`,`LID`,`CSYID`,`ip`)
) ENGINE=InnoDB AUTO_INCREMENT=2702 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `class`
--

DROP TABLE IF EXISTS `class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `classeditor`
--

DROP TABLE IF EXISTS `classeditor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classeditor` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `CSYID` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UNQ_CET` (`Email`,`CSYID`)
) ENGINE=InnoDB AUTO_INCREMENT=247 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `download`
--

DROP TABLE IF EXISTS `download`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `download` (
  `Token` int NOT NULL,
  `Ip` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `CSYID` int NOT NULL,
  PRIMARY KEY (`Token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exampin`
--

DROP TABLE IF EXISTS `exampin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exampin` (
  `LID` int NOT NULL,
  `Pin` char(6) COLLATE utf8mb4_general_ci NOT NULL,
  `Timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`LID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group`
--

DROP TABLE IF EXISTS `group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group` (
  `GID` int NOT NULL AUTO_INCREMENT,
  `CSYID` int DEFAULT NULL,
  `Group` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`GID`),
  UNIQUE KEY `UNQ_Section` (`CSYID`,`Group`)
) ENGINE=InnoDB AUTO_INCREMENT=161 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iplog`
--

DROP TABLE IF EXISTS `iplog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iplog` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `IP` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `UID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=228312 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lab`
--

DROP TABLE IF EXISTS `lab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pinattempt`
--

DROP TABLE IF EXISTS `pinattempt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pinattempt` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `LID` int NOT NULL,
  `UID` char(10) COLLATE utf8mb4_general_ci NOT NULL,
  `Attempt` int NOT NULL,
  `IP` varchar(15) COLLATE utf8mb4_general_ci NOT NULL,
  `Timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UNQ_PAT` (`LID`,`UID`,`IP`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `section`
--

DROP TABLE IF EXISTS `section`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `section` (
  `CID` int NOT NULL AUTO_INCREMENT,
  `CSYID` int DEFAULT NULL,
  `Section` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`CID`),
  UNIQUE KEY `UNQ_Section` (`CSYID`,`Section`)
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `CID` int NOT NULL,
  `UID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `CSYID` int NOT NULL,
  `GID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UNQ_Std` (`UID`,`CSYID`)
) ENGINE=InnoDB AUTO_INCREMENT=4479 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `submitted`
--

DROP TABLE IF EXISTS `submitted`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submitted` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `suspicious`
--

DROP TABLE IF EXISTS `suspicious`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suspicious` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket` (
  `ID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `UID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `LID` int NOT NULL,
  `CSYID` int NOT NULL,
  `Type` tinyint NOT NULL,
  `ip` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UNQ_TKT` (`UID`,`LID`,`CSYID`,`Type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `Email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `UID` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Role` varchar(1) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-05 17:38:48
