
# Change Log

## [v1.6.3] - 2025-01-24
 
### Added

### Changed

### Fixed
    - wrong question's score order when create lab

## [v1.6.2] - 2025-01-20
 
### Added

### Changed

### Fixed
    - 0 score return "-" expected 0

## [v1.6.1] - 2025-01-09
 
### Added

### Changed

### Fixed
    - null score return o expected "-"
    - assign edit show check in/out button even non exam mode

## [v1.6.0] - 2024-12-12
 
### Added
- hide some additional file system

### Changed

### Fixed

## [v1.5.10] - 2024-10-16
 
### Added

### Changed

### Fixed
 - permission DSC

## [v1.5.9] - 2024-10-16
 
### Added
 - Support temperary browsing of safari

### Changed

### Fixed


## [v1.5.8] - 2024-10-16
 
### Added
 - Now QRCode can scan with phone camera

### Changed

### Fixed


## [v1.5.7] - 2024-10-16
 
### Added

### Changed
 - Download all submission will seperate question to sub directory

### Fixed


## [v1.5.6] - 2024-10-15
 
### Added
 - Check in all button

### Changed

### Fixed


## [v1.5.5] - 2024-10-15
 
### Added

### Changed
 - independent LockOnDue and Exam mode

### Fixed


## [v1.5.4] - 2024-10-10
 
### Added
 - download all files button for student
 - download all lab files button for TA this will download all source, release and essential file
 - download sepecific file button in sent in page
 - download all sent in file button in sent in page
 - version tag in navbar

### Changed

### Fixed
 - regrade function


## [v1.5.3] - 2024-10-10
 
### Added
 - show addfile filename in student view

### Changed
 - Refresh page when close QRCode
 - Block submit after checkout
 - Better edit Additional files
 - Hide check in-out page in normal mode
 - remove addfile filename prefix

### Fixed
 - Rank NoneType when MaxScore null


## [v1.5.0] - 2024-10-4
 
### Added
 - Check in-out page
 - Exam mode checkbox
 - Check in-out button in assignment if exam mode
 - QRCode scan button in Assignlist page
 - Check in-out via QRCode

### Changed
 - Regrade submittion when new additional file upload
 - Show filename without wait for grader
 - Block download via api if exam mode
 - Home and Assignlist frontend update to responsive specific for using to scan QRCode

### Fixed
 - Create lab datetime from UTC to GMT+7


## [v1.4.0] - 2024-08-29
 
### Added
 - Question info column in database
 - Set max grading thread worker to 1 and store queue on ram

### Changed
 - Store tester, testcase on database instead of get from file everytime (less complexity)
 - Load only solution from student
 - can set to prevent write file method or not
 - check write file method while adding solution cell (less loop)
 - set execution timeout to 2 seconds
 - return without waiting grading process
 - no return timeout but score 0

### Fixed
 - Empty cell after testcase cause amount of testcase section change


## [v1.3.0] - 2024-08-22
 
### Added
 - Add, Edit, Remove student function.

### Changed

### Fixed


## [v1.2.0] - 2024-08-16
 
### Added

### Changed
 - Reduce time complexity when get student list.

### Fixed


## [v1.1.0] - 2024-08-15
 
### Added

### Changed
- Count max score from published lab only.

### Fixed
- Condition to validate groups in CSV.


## [v1.0.18] - 2024-08-09
 
### Added

### Changed
 - Log client ip to database.

### Fixed


## [v1.0.17] - 2024-08-08
 
### Added

### Changed
 - Regrade all submitted answer if source update

### Fixed


## [v1.0.16] - skipped


## [v1.0.15] - 2024-08-06
 
### Added

### Changed
 
### Fixed
- Time delta method.


## [v1.0.14] - 2024-08-06
 
### Added

### Changed
- Api callback parameter process.
 
### Fixed


## [v1.0.13] - 2024-08-06
 
### Added

### Changed
- Data return when credentials is not valid.
- Decode method.
 
### Fixed


## [v1.0.12] - skipped


## [v1.0.11] - 2024-08-06
 
### Added

### Changed
 
### Fixed
- Callback decode.

## [v1.0.10] - 2024-08-06
 
### Added
- Login service.
### Changed
 
### Fixed


## [v1.0.9] - skipped


## [v1.0.8] - 2024-08-05
 
### Added
 
### Changed
 
### Fixed
- Logging method from flask


## [v1.0.7] - 2024-08-05
 
### Added
 
### Changed
 
### Fixed
- Log state


## [v1.0.6] - 2024-08-05
 
### Added
 
### Changed
 
### Fixed
- Add log


## [v1.0.5] - 2024-08-05
 
### Added
 
### Changed
 
### Fixed
- Bypass check state


## [v1.0.4] - 2024-08-05
 
### Added
 
### Changed
 
### Fixed
- Column 'LID' in field list is ambiguous


## [v1.0.3] - 2024-08-05
 
### Added
 
### Changed
 
### Fixed
- Submit SQL join.


## [v1.0.2] - 2024-08-05
 
### Added
 
### Changed
 
### Fixed
- Submit SQL syntax.
- Callback check state before fetch token.


## [v1.0.1] - 2024-08-04
 
### Added
 
### Changed
 
### Fixed
- Query student select all lab.
- Submit before lab publish.


## [v1.0.0] - 2024-08-01
 
### Added
- First release.
 
### Changed
 
### Fixed
 