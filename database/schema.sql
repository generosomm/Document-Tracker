-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 07, 2026 at 04:23 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dts_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `created_at`) VALUES
(10, 'City Legal Office (CLO)', '2026-01-09 08:19:09'),
(11, 'City Budget Office (CBO)', '2026-01-09 08:20:52'),
(12, 'Office of the City Mayor (OCM)', '2026-01-09 08:21:19'),
(13, 'City Information Office (CIO)', '2026-01-09 08:24:27'),
(15, 'City Management Information Division (CMISD)', '2026-01-09 09:36:53'),
(16, 'City Public Market Office (CPMO)', '2026-01-31 17:40:18'),
(18, 'Business Permit and Licensing Office (BPLO)', '2026-01-31 17:40:46'),
(19, 'City Treasury Office (CTO)', '2026-01-31 17:40:54'),
(20, 'City Procurement Office (CPO)', '2026-01-31 17:42:12'),
(21, 'City Human Resource Management Office (CHRMO)', '2026-01-31 17:42:49'),
(22, 'City Administrator Office (CAO)', '2026-02-03 07:29:54');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `doc_id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `dept` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL,
  `category` varchar(50) NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `original_file_path` varchar(255) DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `progress` int(11) DEFAULT 0,
  `assignee` varchar(100) DEFAULT NULL,
  `finalized_by` varchar(100) DEFAULT '-',
  `custom_route` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`doc_id`, `title`, `description`, `dept`, `status`, `category`, `file_path`, `original_file_path`, `created_date`, `progress`, `assignee`, `finalized_by`, `custom_route`) VALUES
('DOC-10001', 'FY 2026 Office Supplies Procurement', 'Request for budget allocation for office supplies and equipment', 'Office of the City Mayor (OCM)', 'completed', 'Budget Request', 'dummy_propose-letter.pdf', NULL, '2026-02-01 08:15:00', 100, 'City Treasury Office (CTO)', 'CTO Head', '[\"Office of the City Mayor (OCM)\",\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\"]'),
('DOC-10002', 'Purchase Order - IT Equipment', 'Procurement of desktop computers and printers for CMISD', 'City Procurement Office (CPO)', 'completed', 'Purchase Order', 'dummy_propose-letter.pdf', NULL, '2026-01-28 09:00:00', 100, 'Office of the City Mayor (OCM)', 'OCM Head', '[\"City Procurement Office (CPO)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-10003', 'Request for Additional Manpower', 'Request for hiring of additional administrative staff', 'City Human Resource Management Office (CHRMO)', 'progress', 'Request Letter', 'dummy_propose-letter.pdf', NULL, '2026-02-03 10:00:00', 66, 'City Administrator Office (CAO)', NULL, '[\"City Human Resource Management Office (CHRMO)\",\"City Administrator Office (CAO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-10004', 'Q1 Budget Realignment Proposal', 'Proposed budget adjustments for first quarter programs', 'City Budget Office (CBO)', 'progress', 'Budget Request', 'dummy_propose-letter.pdf', NULL, '2026-02-05 14:00:00', 66, 'Office of the City Mayor (OCM)', NULL, '[\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\",\"City Treasury Office (CTO)\"]'),
('DOC-10005', 'City Hall Renovation Project Proposal', 'Proposal for renovation and modernization of City Hall facilities', 'City Administrator Office (CAO)', 'completed', 'Proposal', 'dummy_propose-letter.pdf', NULL, '2026-01-25 08:00:00', 100, 'Office of the City Mayor (OCM)', 'OCM Head', '[\"City Administrator Office (CAO)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-10006', 'Promotion Order - Administrative Aide III', 'Promotion of employee to Administrative Aide III position', 'City Human Resource Management Office (CHRMO)', 'pending', 'Personnel Action', 'dummy_propose-letter.pdf', NULL, '2026-02-06 07:00:00', 66, 'City Legal Office (CLO)', NULL, '[\"City Human Resource Management Office (CHRMO)\",\"City Legal Office (CLO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-10007', 'Purchase Order - Office Furniture', 'Procurement of office chairs and tables for various departments', 'City Procurement Office (CPO)', 'progress', 'Purchase Order', 'dummy_propose-letter.pdf', NULL, '2026-02-04 11:00:00', 66, 'City Budget Office (CBO)', NULL, '[\"City Procurement Office (CPO)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-10008', 'Fund Request for Revenue Collection System', 'Request for budget to upgrade revenue collection software', 'City Treasury Office (CTO)', 'completed', 'Budget Request', 'dummy_propose-letter.pdf', NULL, '2026-01-20 10:00:00', 100, 'Office of the City Mayor (OCM)', 'OCM Head', '[\"City Treasury Office (CTO)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-10009', 'Request for Social Media Campaign Budget', 'Request for allocation to city social media awareness campaign', 'City Information Office (CIO)', 'pending', 'Request Letter', 'dummy_propose-letter.pdf', NULL, '2026-02-06 09:30:00', 66, 'City Administrator Office (CAO)', NULL, '[\"City Information Office (CIO)\",\"City Administrator Office (CAO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-10010', 'City Ordinance Draft - Waste Management', 'Draft ordinance for improved waste management system', 'City Legal Office (CLO)', 'completed', 'Legal Review', 'dummy_propose-letter.pdf', NULL, '2026-01-15 09:00:00', 100, 'Office of the City Mayor (OCM)', 'OCM Head', '[\"City Legal Office (CLO)\",\"City Information Office (CIO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-10011', 'BPLO Quarterly Revenue Report and Budget Request', 'Request for additional budget based on Q4 2025 revenue performance', 'Business Permit and Licensing Office (BPLO)', 'progress', 'Budget Request', 'dummy_propose-letter.pdf', NULL, '2026-02-05 08:00:00', 50, 'City Budget Office (CBO)', NULL, '[\"Business Permit and Licensing Office (BPLO)\",\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-10012', 'Network Infrastructure Upgrade Purchase Order', 'Procurement of routers, switches, and network cables for city-wide upgrade', 'City Management Information Division (CMISD)', 'pending', 'Purchase Order', 'dummy_propose-letter.pdf', NULL, '2026-02-06 07:30:00', 66, 'City Budget Office (CBO)', NULL, '[\"City Management Information Division (CMISD)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-10013', 'Public Market Maintenance Fund Request', 'Request for release of funds for market facility repairs and cleaning', 'City Public Market Office (CPMO)', 'progress', 'Budget Request', 'dummy_propose-letter.pdf', NULL, '2026-02-04 15:00:00', 100, 'City Treasury Office (CTO)', NULL, '[\"City Public Market Office (CPMO)\",\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\"]'),
('DOC-10014', 'Employee Benefits and Allowances Release', 'Request for release of employee year-end benefits and uniform allowances', 'City Human Resource Management Office (CHRMO)', 'progress', 'Budget Request', 'dummy_propose-letter.pdf', NULL, '2026-02-03 13:00:00', 100, 'City Treasury Office (CTO)', NULL, '[\"City Human Resource Management Office (CHRMO)\",\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\"]'),
('DOC-10015', 'Smart City Initiative Implementation Plan', 'Comprehensive proposal for implementing smart city technologies in Sto. Tomas', 'City Administrator Office (CAO)', 'progress', 'Proposal', 'dummy_propose-letter.pdf', NULL, '2026-02-03 06:00:00', 100, 'Office of the City Mayor (OCM)', NULL, '[\"City Administrator Office (CAO)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-10016', 'Request for City Website Redesign and Development', 'Request for approval and budget for official city website modernization', 'City Information Office (CIO)', 'progress', 'Request Letter', 'dummy_propose-letter.pdf', NULL, '2026-02-04 16:00:00', 100, 'Office of the City Mayor (OCM)', NULL, '[\"City Information Office (CIO)\",\"City Administrator Office (CAO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-10017', 'Draft Resolution - Youth Development Program', 'Draft resolution for establishing city-wide youth development and skills training program', 'City Legal Office (CLO)', 'progress', 'Legal Review', 'dummy_propose-letter.pdf', NULL, '2026-02-06 09:00:00', 100, 'Office of the City Mayor (OCM)', NULL, '[\"City Legal Office (CLO)\",\"City Information Office (CIO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-10018', 'Media Equipment Purchase Request', 'Request for budget allocation for cameras, lighting, and video editing equipment', 'City Information Office (CIO)', 'progress', 'Budget Request', 'dummy_propose-letter.pdf', NULL, '2026-02-05 10:00:00', 66, 'City Budget Office (CBO)', NULL, '[\"City Information Office (CIO)\",\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\"]'),
('DOC-10019', 'Administrative Supplies Replenishment Fund', 'Request for fund release for office supplies across all departments', 'City Administrator Office (CAO)', 'pending', 'Budget Request', 'dummy_propose-letter.pdf', NULL, '2026-02-06 11:00:00', 100, 'City Treasury Office (CTO)', NULL, '[\"City Administrator Office (CAO)\",\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\"]'),
('DOC-10020', 'Vehicle Fleet Maintenance and Parts Purchase Order', 'Procurement of spare parts and maintenance services for city government vehicles', 'City Procurement Office (CPO)', 'progress', 'Purchase Order', 'dummy_propose-letter.pdf', NULL, '2026-02-03 08:30:00', 100, 'Office of the City Mayor (OCM)', NULL, '[\"City Procurement Office (CPO)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-20241', 'Annual Budget Appropriation Ordinance FY 2026', 'Final budget appropriation ordinance for fiscal year 2026 operations', 'City Budget Office (CBO)', 'completed', 'Disbursement Voucher', 'dummy_propose-letter.pdf', NULL, '2026-01-15 09:00:00', 100, 'Office of the City Mayor (OCM)', 'OCM Head', '[\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-20242', 'Quarterly Cash Advance Request - Q1 2026', 'Request for cash advance to fund first quarter operations', 'City Budget Office (CBO)', 'progress', 'Payment Request', 'dummy_propose-letter.pdf', NULL, '2026-02-04 10:00:00', 100, 'City Treasury Office (CTO)', NULL, '[\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\"]'),
('DOC-20243', 'Monthly Revenue Collection Report - January 2026', 'Comprehensive report of all revenue collections for January', 'City Treasury Office (CTO)', 'pending', 'Audit Report', 'dummy_propose-letter.pdf', NULL, '2026-02-06 08:00:00', 100, 'Office of the City Mayor (OCM)', NULL, '[\"City Treasury Office (CTO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-20244', 'Supplemental Budget No. 1 - Emergency Fund Allocation', 'Request for supplemental budget for emergency disaster response', 'City Budget Office (CBO)', 'progress', 'Budget Request', 'dummy_propose-letter.pdf', NULL, '2026-02-03 08:00:00', 100, 'Office of the City Mayor (OCM)', NULL, '[\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-20245', 'City Mayor Special Project Fund Request', 'Request for release of funds for special city development projects', 'Office of the City Mayor (OCM)', 'pending', 'Budget Request', 'dummy_propose-letter.pdf', NULL, '2026-02-06 09:30:00', 66, 'City Budget Office (CBO)', NULL, '[\"Office of the City Mayor (OCM)\",\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\"]'),
('DOC-20246', 'Employee Honorarium Payment Authorization', 'Authorization for payment of employee honorarium for special services', 'Office of the City Mayor (OCM)', 'completed', 'Disbursement Voucher', 'dummy_propose-letter.pdf', NULL, '2026-01-28 10:00:00', 100, 'City Treasury Office (CTO)', 'CTO Head', '[\"Office of the City Mayor (OCM)\",\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\"]'),
('DOC-20247', 'Utility Bills Payment Request - February 2026', 'Request for payment of electricity, water, and internet bills for city offices', 'City Budget Office (CBO)', 'progress', 'Payment Request', 'dummy_propose-letter.pdf', NULL, '2026-02-05 14:00:00', 100, 'City Treasury Office (CTO)', NULL, '[\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\"]'),
('DOC-20248', 'Salary Differential Payment Request', 'Request for release of salary differential for promoted employees', 'City Budget Office (CBO)', 'pending', 'Payment Request', 'dummy_propose-letter.pdf', NULL, '2026-02-06 10:30:00', 100, 'City Treasury Office (CTO)', NULL, '[\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\"]'),
('DOC-20249', 'Budget Utilization Report - December 2025', 'Comprehensive report on budget utilization for December', 'City Budget Office (CBO)', 'completed', 'Audit Report', 'dummy_propose-letter.pdf', NULL, '2026-01-10 09:00:00', 100, 'Office of the City Mayor (OCM)', 'OCM Head', '[\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-20250', 'Treasury Annual Income Statement 2025', 'Annual financial statement of city income for fiscal year 2025', 'City Treasury Office (CTO)', 'pending', 'Audit Report', 'dummy_propose-letter.pdf', NULL, '2026-02-06 11:00:00', 66, 'City Budget Office (CBO)', NULL, '[\"City Treasury Office (CTO)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-20251', 'Budget Clearance Certificate for Employee Retirement', 'Certificate of budget clearance for retiring employee benefits', 'City Budget Office (CBO)', 'progress', 'Personnel Action', 'dummy_propose-letter.pdf', NULL, '2026-02-05 09:00:00', 66, 'City Human Resource Management Office (CHRMO)', NULL, '[\"City Budget Office (CBO)\",\"City Human Resource Management Office (CHRMO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-20252', 'Budget Compliance Certification for Procurement', 'Certification that procurement request complies with approved budget', 'City Budget Office (CBO)', 'pending', 'Procurement Plan', 'dummy_propose-letter.pdf', NULL, '2026-02-06 13:00:00', 66, 'City Procurement Office (CPO)', NULL, '[\"City Budget Office (CBO)\",\"City Procurement Office (CPO)\",\"City Legal Office (CLO)\"]'),
('DOC-20253', 'Monthly Budget Performance Report - January 2026', 'Report on budget performance and variance analysis for January', 'City Budget Office (CBO)', 'completed', 'Audit Report', 'dummy_propose-letter.pdf', NULL, '2026-02-01 08:00:00', 100, 'City Administrator Office (CAO)', 'CAO Head', '[\"City Budget Office (CBO)\",\"City Administrator Office (CAO)\"]'),
('DOC-20254', 'Business Tax Collection Summary Report', 'Summary of business tax collections and remittances', 'City Treasury Office (CTO)', 'progress', 'Audit Report', 'dummy_propose-letter.pdf', NULL, '2026-02-04 11:00:00', 66, 'Business Permit and Licensing Office (BPLO)', NULL, '[\"City Treasury Office (CTO)\",\"Business Permit and Licensing Office (BPLO)\",\"City Management Information Division (CMISD)\"]'),
('DOC-20255', 'Cash Position Report - Week 5', 'Weekly cash position and liquidity status report', 'City Treasury Office (CTO)', 'pending', 'Audit Report', 'dummy_propose-letter.pdf', NULL, '2026-02-06 14:00:00', 66, 'City Administrator Office (CAO)', NULL, '[\"City Treasury Office (CTO)\",\"City Administrator Office (CAO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-20256', 'Market Stall Rental Payment Confirmation', 'Confirmation of rental payments received from market vendors', 'City Treasury Office (CTO)', 'completed', 'Payment Request', 'dummy_propose-letter.pdf', NULL, '2026-01-25 10:00:00', 100, 'City Public Market Office (CPMO)', 'CPMO Head', '[\"City Treasury Office (CTO)\",\"City Public Market Office (CPMO)\"]'),
('DOC-20257', 'Memorandum on Work-From-Home Policy Implementation', 'Official memorandum on flexible work arrangement guidelines', 'Office of the City Mayor (OCM)', 'progress', 'Memorandum', 'dummy_propose-letter.pdf', NULL, '2026-02-05 08:00:00', 66, 'City Administrator Office (CAO)', NULL, '[\"Office of the City Mayor (OCM)\",\"City Administrator Office (CAO)\",\"City Human Resource Management Office (CHRMO)\"]'),
('DOC-20258', 'Special Order - Media Coverage for City Events', 'Special order designating information officers for city event coverage', 'Office of the City Mayor (OCM)', 'pending', 'Special Order', 'dummy_propose-letter.pdf', NULL, '2026-02-06 15:00:00', 100, 'City Information Office (CIO)', NULL, '[\"Office of the City Mayor (OCM)\",\"City Information Office (CIO)\"]'),
('DOC-20259', 'Executive Order - Creation of Task Force on Traffic Management', 'Executive order establishing special task force for city traffic concerns', 'Office of the City Mayor (OCM)', 'completed', 'Resolution', 'dummy_propose-letter.pdf', NULL, '2026-01-18 09:00:00', 100, 'City Information Office (CIO)', 'CIO Head', '[\"Office of the City Mayor (OCM)\",\"City Legal Office (CLO)\",\"City Information Office (CIO)\"]'),
('DOC-20260', 'Training Budget Request for Employee Development', 'Request for budget allocation for employee skills training program', 'City Human Resource Management Office (CHRMO)', 'pending', 'Training Request', 'dummy_propose-letter.pdf', NULL, '2026-02-06 16:00:00', 66, 'City Budget Office (CBO)', NULL, '[\"City Human Resource Management Office (CHRMO)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-20261', 'Equipment Request - New Air Conditioning Units', 'Request for procurement of air conditioning units for city offices', 'City Procurement Office (CPO)', 'progress', 'Equipment Request', 'dummy_propose-letter.pdf', NULL, '2026-02-05 11:00:00', 66, 'City Budget Office (CBO)', NULL, '[\"City Procurement Office (CPO)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-20262', 'Business Permit Renewal Payment Verification', 'Verification of business permit renewal payments for 2026', 'Business Permit and Licensing Office (BPLO)', 'pending', 'Permit Application', 'dummy_propose-letter.pdf', NULL, '2026-02-07 08:00:00', 66, 'City Treasury Office (CTO)', NULL, '[\"Business Permit and Licensing Office (BPLO)\",\"City Treasury Office (CTO)\",\"City Management Information Division (CMISD)\"]'),
('DOC-20263', 'Market Revenue Remittance for January 2026', 'Monthly revenue remittance from public market operations', 'City Public Market Office (CPMO)', 'progress', 'Payment Request', 'dummy_propose-letter.pdf', NULL, '2026-02-03 09:00:00', 100, 'City Treasury Office (CTO)', NULL, '[\"City Public Market Office (CPMO)\",\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\"]'),
('DOC-20264', 'Administrative Inspection Report - All City Offices', 'Comprehensive inspection report on cleanliness and maintenance of city offices', 'City Administrator Office (CAO)', 'pending', 'Inspection Report', 'dummy_propose-letter.pdf', NULL, '2026-02-07 09:00:00', 100, 'Office of the City Mayor (OCM)', NULL, '[\"City Administrator Office (CAO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-20265', 'Draft Ordinance - Community Health and Sanitation', 'Draft ordinance on community health standards and sanitation measures', 'City Legal Office (CLO)', 'progress', 'Ordinance', 'dummy_propose-letter.pdf', NULL, '2026-02-04 08:00:00', 100, 'Office of the City Mayor (OCM)', NULL, '[\"City Legal Office (CLO)\",\"City Information Office (CIO)\",\"Office of the City Mayor (OCM)\"]'),
('DOC-99275', 'srhsr', 'srhsr', 'Office of the City Mayor (OCM)', 'completed', 'Budget Request', '1770330940_Request_Letter.pdf', NULL, '2026-02-06 06:35:40', 100, 'City Treasury Office (CTO)', '-', '[\"Office of the City Mayor (OCM)\",\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\"]');

-- --------------------------------------------------------

--
-- Table structure for table `doc_timeline`
--

CREATE TABLE `doc_timeline` (
  `id` int(11) NOT NULL,
  `doc_id` varchar(50) NOT NULL,
  `user` varchar(100) NOT NULL,
  `role` varchar(50) NOT NULL,
  `action` varchar(100) NOT NULL,
  `timestamp` datetime NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `meta` varchar(255) DEFAULT NULL,
  `view_tag` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doc_timeline`
--

INSERT INTO `doc_timeline` (`id`, `doc_id`, `user`, `role`, `action`, `timestamp`, `icon`, `details`, `meta`, `view_tag`) VALUES
(1, 'DOC-99275', 'OCM Head', 'Department Head', 'Document Created', '2026-02-06 06:35:40', 'ri-upload-cloud-line', 'Uploaded via Drag & Drop or File Picker', NULL, NULL),
(2, 'DOC-99275', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-02-06 06:35:45', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(3, 'DOC-99275', 'OCM Head', 'Staff', 'Signed', '2026-02-06 06:36:00', 'ri-pen-nib-fill', 'Signed', NULL, NULL),
(4, 'DOC-99275', 'OCM Head', 'Office of the City Mayor (OCM)', 'Transferred', '2026-02-06 06:36:02', 'ri-share-forward-fill', 'Transferred to City Budget Office (CBO).', NULL, NULL),
(5, 'DOC-99275', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-06 06:36:35', 'ri-eye-line', 'Duration: 4s', NULL, NULL),
(6, 'DOC-99275', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-02-06 06:36:42', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(7, 'DOC-99275', 'CBO Head', 'Staff', 'Signed', '2026-02-06 06:36:56', 'ri-pen-nib-fill', 'Signed', NULL, NULL),
(8, 'DOC-99275', 'CBO Head', 'City Budget Office (CBO)', 'Transferred', '2026-02-06 06:37:00', 'ri-share-forward-fill', 'Transferred to City Treasury Office (CTO).', NULL, NULL),
(9, 'DOC-99275', 'CTO Head', 'City Treasury Office (CTO)', 'In Progress', '2026-02-06 06:37:21', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(10, 'DOC-99275', 'CTO Head', 'Staff', 'Signed', '2026-02-06 06:37:38', 'ri-pen-nib-fill', 'Signed', NULL, NULL),
(11, 'DOC-99275', 'CTO Head', 'City Treasury Office (CTO)', 'Transferred', '2026-02-06 06:37:41', 'ri-share-forward-fill', 'Document Completed (Ready for Archiving).', NULL, NULL),
(12, 'DOC-99275', 'CTO Head', 'City Treasury Office (CTO)', 'Viewed', '2026-02-06 06:44:22', 'ri-eye-line', 'Duration: 6m 30s', NULL, NULL),
(13, 'DOC-99275', 'CTO Head', 'City Treasury Office (CTO)', 'Viewed', '2026-02-06 07:19:10', 'ri-eye-line', 'Duration: 27m 10s', NULL, NULL),
(14, 'DOC-99275', 'CTO Head', 'City Treasury Office (CTO)', 'Viewed', '2026-02-06 23:33:58', 'ri-eye-line', 'Duration: 6m 9s', NULL, NULL),
(15, 'DOC-10001', 'OCM Head', 'Department Head', 'Document Created', '2026-02-01 08:15:00', 'ri-upload-cloud-line', 'Budget request for office supplies', NULL, NULL),
(16, 'DOC-10001', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-02-01 08:16:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(17, 'DOC-10001', 'OCM Head', 'Department Head', 'Signed', '2026-02-01 08:20:00', 'ri-pen-nib-fill', 'Approved by OCM', NULL, NULL),
(18, 'DOC-10001', 'OCM Head', 'Office of the City Mayor (OCM)', 'Transferred', '2026-02-01 08:21:00', 'ri-share-forward-fill', 'Transferred to City Budget Office (CBO).', NULL, NULL),
(19, 'DOC-10001', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-02-01 09:30:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(20, 'DOC-10001', 'CBO Head', 'Department Head', 'Signed', '2026-02-01 10:15:00', 'ri-pen-nib-fill', 'Budget allocation verified', NULL, NULL),
(21, 'DOC-10001', 'CBO Head', 'City Budget Office (CBO)', 'Transferred', '2026-02-01 10:16:00', 'ri-share-forward-fill', 'Transferred to City Treasury Office (CTO).', NULL, NULL),
(22, 'DOC-10001', 'CTO Head', 'City Treasury Office (CTO)', 'In Progress', '2026-02-01 13:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(23, 'DOC-10001', 'CTO Head', 'Department Head', 'Signed', '2026-02-01 14:00:00', 'ri-pen-nib-fill', 'Fund allocation approved', NULL, NULL),
(24, 'DOC-10001', 'CTO Head', 'City Treasury Office (CTO)', 'Transferred', '2026-02-01 14:01:00', 'ri-share-forward-fill', 'Document Completed (Ready for Archiving).', NULL, NULL),
(25, 'DOC-10002', 'CPO Head', 'Department Head', 'Document Created', '2026-01-28 09:00:00', 'ri-upload-cloud-line', 'Purchase order for IT equipment', NULL, NULL),
(26, 'DOC-10002', 'CPO Head', 'City Procurement Office (CPO)', 'In Progress', '2026-01-28 09:05:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(27, 'DOC-10002', 'CPO Head', 'Department Head', 'Signed', '2026-01-28 09:30:00', 'ri-pen-nib-fill', 'Procurement specifications approved', NULL, NULL),
(28, 'DOC-10002', 'CPO Head', 'City Procurement Office (CPO)', 'Transferred', '2026-01-28 09:31:00', 'ri-share-forward-fill', 'Transferred to City Budget Office (CBO).', NULL, NULL),
(29, 'DOC-10002', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-01-29 10:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(30, 'DOC-10002', 'CBO Head', 'Department Head', 'Signed', '2026-01-29 11:00:00', 'ri-pen-nib-fill', 'Budget availability confirmed', NULL, NULL),
(31, 'DOC-10002', 'CBO Head', 'City Budget Office (CBO)', 'Transferred', '2026-01-29 11:01:00', 'ri-share-forward-fill', 'Transferred to Office of the City Mayor (OCM).', NULL, NULL),
(32, 'DOC-10002', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-01-30 08:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(33, 'DOC-10002', 'OCM Head', 'Department Head', 'Signed', '2026-01-30 09:00:00', 'ri-pen-nib-fill', 'Purchase order approved by City Mayor', NULL, NULL),
(34, 'DOC-10002', 'OCM Head', 'Office of the City Mayor (OCM)', 'Transferred', '2026-01-30 09:01:00', 'ri-share-forward-fill', 'Document Completed (Ready for Archiving).', NULL, NULL),
(35, 'DOC-10003', 'CHRMO Head', 'Department Head', 'Document Created', '2026-02-03 10:00:00', 'ri-upload-cloud-line', 'Manpower request letter', NULL, NULL),
(36, 'DOC-10003', 'CHRMO Head', 'City Human Resource Management Office (CHRMO)', 'In Progress', '2026-02-03 10:05:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(37, 'DOC-10003', 'CHRMO Head', 'Department Head', 'Signed', '2026-02-03 10:30:00', 'ri-pen-nib-fill', 'Manpower assessment completed', NULL, NULL),
(38, 'DOC-10003', 'CHRMO Head', 'City Human Resource Management Office (CHRMO)', 'Transferred', '2026-02-03 10:31:00', 'ri-share-forward-fill', 'Transferred to City Administrator Office (CAO).', NULL, NULL),
(39, 'DOC-10003', 'CAO Head', 'City Administrator Office (CAO)', 'In Progress', '2026-02-04 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(40, 'DOC-10004', 'Budget Head Zedryl', 'Department Head', 'Document Created', '2026-02-05 14:00:00', 'ri-upload-cloud-line', 'Budget realignment for Q1 2026', NULL, NULL),
(41, 'DOC-10005', 'CAO Head', 'Department Head', 'Document Created', '2026-01-25 08:00:00', 'ri-upload-cloud-line', 'Renovation project proposal', NULL, NULL),
(42, 'DOC-10005', 'CAO Head', 'City Administrator Office (CAO)', 'In Progress', '2026-01-25 08:10:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(43, 'DOC-10005', 'CAO Head', 'Department Head', 'Signed', '2026-01-25 09:00:00', 'ri-pen-nib-fill', 'Project proposal endorsed', NULL, NULL),
(44, 'DOC-10005', 'CAO Head', 'City Administrator Office (CAO)', 'Transferred', '2026-01-25 09:01:00', 'ri-share-forward-fill', 'Transferred to City Budget Office (CBO).', NULL, NULL),
(45, 'DOC-10005', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-01-26 10:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(46, 'DOC-10005', 'CBO Head', 'Department Head', 'Signed', '2026-01-26 15:00:00', 'ri-pen-nib-fill', 'Budget feasibility confirmed', NULL, NULL),
(47, 'DOC-10005', 'CBO Head', 'City Budget Office (CBO)', 'Transferred', '2026-01-26 15:01:00', 'ri-share-forward-fill', 'Transferred to Office of the City Mayor (OCM).', NULL, NULL),
(48, 'DOC-10005', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-01-27 08:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(49, 'DOC-10005', 'OCM Head', 'Department Head', 'Signed', '2026-01-27 10:00:00', 'ri-pen-nib-fill', 'Project approved by City Mayor', NULL, NULL),
(50, 'DOC-10005', 'OCM Head', 'Office of the City Mayor (OCM)', 'Transferred', '2026-01-27 10:01:00', 'ri-share-forward-fill', 'Document Completed (Ready for Archiving).', NULL, NULL),
(51, 'DOC-10006', 'CHRMO Head', 'Department Head', 'Document Created', '2026-02-06 07:00:00', 'ri-upload-cloud-line', 'Employee promotion order', NULL, NULL),
(52, 'DOC-10007', 'CPO Head', 'Department Head', 'Document Created', '2026-02-04 11:00:00', 'ri-upload-cloud-line', 'Office furniture procurement', NULL, NULL),
(53, 'DOC-10007', 'CPO Head', 'City Procurement Office (CPO)', 'In Progress', '2026-02-04 11:10:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(54, 'DOC-10007', 'CPO Head', 'Department Head', 'Signed', '2026-02-04 13:00:00', 'ri-pen-nib-fill', 'Procurement approved', NULL, NULL),
(55, 'DOC-10007', 'CPO Head', 'City Procurement Office (CPO)', 'Transferred', '2026-02-04 13:01:00', 'ri-share-forward-fill', 'Transferred to City Budget Office (CBO).', NULL, NULL),
(56, 'DOC-10007', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-02-05 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(57, 'DOC-10008', 'CTO Head', 'Department Head', 'Document Created', '2026-01-20 10:00:00', 'ri-upload-cloud-line', 'System upgrade budget request', NULL, NULL),
(58, 'DOC-10008', 'CTO Head', 'City Treasury Office (CTO)', 'In Progress', '2026-01-20 10:10:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(59, 'DOC-10008', 'CTO Head', 'Department Head', 'Signed', '2026-01-20 11:00:00', 'ri-pen-nib-fill', 'Request endorsed', NULL, NULL),
(60, 'DOC-10008', 'CTO Head', 'City Treasury Office (CTO)', 'Transferred', '2026-01-20 11:01:00', 'ri-share-forward-fill', 'Transferred to City Budget Office (CBO).', NULL, NULL),
(61, 'DOC-10008', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-01-21 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(62, 'DOC-10008', 'CBO Head', 'Department Head', 'Signed', '2026-01-21 14:00:00', 'ri-pen-nib-fill', 'Budget allocation approved', NULL, NULL),
(63, 'DOC-10008', 'CBO Head', 'City Budget Office (CBO)', 'Transferred', '2026-01-21 14:01:00', 'ri-share-forward-fill', 'Transferred to Office of the City Mayor (OCM).', NULL, NULL),
(64, 'DOC-10008', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-01-22 08:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(65, 'DOC-10008', 'OCM Head', 'Department Head', 'Signed', '2026-01-22 10:00:00', 'ri-pen-nib-fill', 'Final approval granted', NULL, NULL),
(66, 'DOC-10008', 'OCM Head', 'Office of the City Mayor (OCM)', 'Transferred', '2026-01-22 10:01:00', 'ri-share-forward-fill', 'Document Completed (Ready for Archiving).', NULL, NULL),
(67, 'DOC-10009', 'CIO Head', 'Department Head', 'Document Created', '2026-02-06 09:30:00', 'ri-upload-cloud-line', 'Social media campaign budget request', NULL, NULL),
(68, 'DOC-10010', 'CLO Head', 'Department Head', 'Document Created', '2026-01-15 09:00:00', 'ri-upload-cloud-line', 'Draft ordinance for review', NULL, NULL),
(69, 'DOC-10010', 'CLO Head', 'City Legal Office (CLO)', 'In Progress', '2026-01-15 09:15:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(70, 'DOC-10010', 'CLO Head', 'Department Head', 'Signed', '2026-01-15 11:00:00', 'ri-pen-nib-fill', 'Legal review completed', NULL, NULL),
(71, 'DOC-10010', 'CLO Head', 'City Legal Office (CLO)', 'Transferred', '2026-01-15 11:01:00', 'ri-share-forward-fill', 'Transferred to City Information Office (CIO).', NULL, NULL),
(72, 'DOC-10010', 'CIO Head', 'City Information Office (CIO)', 'In Progress', '2026-01-16 10:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(73, 'DOC-10010', 'CIO Head', 'Department Head', 'Signed', '2026-01-16 14:00:00', 'ri-pen-nib-fill', 'Public information review done', NULL, NULL),
(74, 'DOC-10010', 'CIO Head', 'City Information Office (CIO)', 'Transferred', '2026-01-16 14:01:00', 'ri-share-forward-fill', 'Transferred to Office of the City Mayor (OCM).', NULL, NULL),
(75, 'DOC-10010', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-01-17 08:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(76, 'DOC-10010', 'OCM Head', 'Department Head', 'Signed', '2026-01-17 09:30:00', 'ri-pen-nib-fill', 'Ordinance approved for council submission', NULL, NULL),
(77, 'DOC-10010', 'OCM Head', 'Office of the City Mayor (OCM)', 'Transferred', '2026-01-17 09:31:00', 'ri-share-forward-fill', 'Document Completed (Ready for Archiving).', NULL, NULL),
(93, 'DOC-10004', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-02-06 23:42:31', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(94, 'DOC-10004', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-06 23:42:34', 'ri-eye-line', 'Duration: 3s', NULL, NULL),
(95, 'DOC-10011', 'BPLO Head', 'Department Head', 'Document Created', '2026-02-05 08:00:00', 'ri-upload-cloud-line', 'Quarterly budget request based on revenue performance', NULL, NULL),
(96, 'DOC-10011', 'BPLO Head', 'Business Permit and Licensing Office (BPLO)', 'In Progress', '2026-02-05 08:10:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(97, 'DOC-10011', 'BPLO Head', 'Department Head', 'Signed', '2026-02-05 09:00:00', 'ri-pen-nib-fill', 'Revenue report approved', NULL, NULL),
(98, 'DOC-10011', 'BPLO Head', 'Business Permit and Licensing Office (BPLO)', 'Transferred', '2026-02-05 09:01:00', 'ri-share-forward-fill', 'Transferred to City Budget Office (CBO).', NULL, NULL),
(99, 'DOC-10011', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-02-06 10:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(100, 'DOC-10012', 'CMISD Head', 'Department Head', 'Document Created', '2026-02-06 07:30:00', 'ri-upload-cloud-line', 'Network infrastructure procurement request', NULL, NULL),
(101, 'DOC-10013', 'CPMO Head', 'Department Head', 'Document Created', '2026-02-04 15:00:00', 'ri-upload-cloud-line', 'Market maintenance fund request', NULL, NULL),
(102, 'DOC-10013', 'CPMO Head', 'City Public Market Office (CPMO)', 'In Progress', '2026-02-04 15:10:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(103, 'DOC-10013', 'CPMO Head', 'Department Head', 'Signed', '2026-02-04 16:00:00', 'ri-pen-nib-fill', 'Request endorsed', NULL, NULL),
(104, 'DOC-10013', 'CPMO Head', 'City Public Market Office (CPMO)', 'Transferred', '2026-02-04 16:01:00', 'ri-share-forward-fill', 'Transferred to City Budget Office (CBO).', NULL, NULL),
(105, 'DOC-10013', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-02-05 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(106, 'DOC-10013', 'CBO Head', 'Department Head', 'Signed', '2026-02-05 11:00:00', 'ri-pen-nib-fill', 'Budget verified', NULL, NULL),
(107, 'DOC-10013', 'CBO Head', 'City Budget Office (CBO)', 'Transferred', '2026-02-05 11:01:00', 'ri-share-forward-fill', 'Transferred to City Treasury Office (CTO).', NULL, NULL),
(108, 'DOC-10013', 'CTO Head', 'City Treasury Office (CTO)', 'In Progress', '2026-02-06 08:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(109, 'DOC-10014', 'CHRMO Head', 'Department Head', 'Document Created', '2026-02-03 13:00:00', 'ri-upload-cloud-line', 'Employee benefits release request', NULL, NULL),
(110, 'DOC-10014', 'CHRMO Head', 'City Human Resource Management Office (CHRMO)', 'In Progress', '2026-02-03 13:15:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(111, 'DOC-10014', 'CHRMO Head', 'Department Head', 'Signed', '2026-02-03 14:00:00', 'ri-pen-nib-fill', 'Payroll verified', NULL, NULL),
(112, 'DOC-10014', 'CHRMO Head', 'City Human Resource Management Office (CHRMO)', 'Transferred', '2026-02-03 14:01:00', 'ri-share-forward-fill', 'Transferred to City Budget Office (CBO).', NULL, NULL),
(113, 'DOC-10014', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-02-04 10:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(114, 'DOC-10014', 'CBO Head', 'Department Head', 'Signed', '2026-02-04 15:00:00', 'ri-pen-nib-fill', 'Fund allocation confirmed', NULL, NULL),
(115, 'DOC-10014', 'CBO Head', 'City Budget Office (CBO)', 'Transferred', '2026-02-04 15:01:00', 'ri-share-forward-fill', 'Transferred to City Treasury Office (CTO).', NULL, NULL),
(116, 'DOC-10014', 'CTO Head', 'City Treasury Office (CTO)', 'In Progress', '2026-02-05 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(117, 'DOC-10015', 'CAO Head', 'Department Head', 'Document Created', '2026-02-03 06:00:00', 'ri-upload-cloud-line', 'Smart city implementation proposal', NULL, NULL),
(118, 'DOC-10015', 'CAO Head', 'City Administrator Office (CAO)', 'In Progress', '2026-02-03 06:15:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(119, 'DOC-10015', 'CAO Head', 'Department Head', 'Signed', '2026-02-03 08:00:00', 'ri-pen-nib-fill', 'Proposal endorsed', NULL, NULL),
(120, 'DOC-10015', 'CAO Head', 'City Administrator Office (CAO)', 'Transferred', '2026-02-03 08:01:00', 'ri-share-forward-fill', 'Transferred to City Budget Office (CBO).', NULL, NULL),
(121, 'DOC-10015', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-02-04 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(122, 'DOC-10015', 'CBO Head', 'Department Head', 'Signed', '2026-02-04 14:00:00', 'ri-pen-nib-fill', 'Budget feasibility reviewed', NULL, NULL),
(123, 'DOC-10015', 'CBO Head', 'City Budget Office (CBO)', 'Transferred', '2026-02-04 14:01:00', 'ri-share-forward-fill', 'Transferred to Office of the City Mayor (OCM).', NULL, NULL),
(124, 'DOC-10015', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-02-05 08:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(125, 'DOC-10016', 'CIO Head', 'Department Head', 'Document Created', '2026-02-04 16:00:00', 'ri-upload-cloud-line', 'Website redesign project request', NULL, NULL),
(126, 'DOC-10016', 'CIO Head', 'City Information Office (CIO)', 'In Progress', '2026-02-04 16:10:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(127, 'DOC-10016', 'CIO Head', 'Department Head', 'Signed', '2026-02-04 17:00:00', 'ri-pen-nib-fill', 'Project proposal endorsed', NULL, NULL),
(128, 'DOC-10016', 'CIO Head', 'City Information Office (CIO)', 'Transferred', '2026-02-04 17:01:00', 'ri-share-forward-fill', 'Transferred to City Administrator Office (CAO).', NULL, NULL),
(129, 'DOC-10016', 'CAO Head', 'City Administrator Office (CAO)', 'In Progress', '2026-02-05 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(130, 'DOC-10016', 'CAO Head', 'Department Head', 'Signed', '2026-02-05 14:00:00', 'ri-pen-nib-fill', 'Administrative review completed', NULL, NULL),
(131, 'DOC-10016', 'CAO Head', 'City Administrator Office (CAO)', 'Transferred', '2026-02-05 14:01:00', 'ri-share-forward-fill', 'Transferred to Office of the City Mayor (OCM).', NULL, NULL),
(132, 'DOC-10016', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-02-06 08:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(133, 'DOC-10017', 'CLO Head', 'Department Head', 'Document Created', '2026-02-06 09:00:00', 'ri-upload-cloud-line', 'Youth development resolution draft', NULL, NULL),
(134, 'DOC-10018', 'CIO Head', 'Department Head', 'Document Created', '2026-02-05 10:00:00', 'ri-upload-cloud-line', 'Media equipment budget request', NULL, NULL),
(135, 'DOC-10018', 'CIO Head', 'City Information Office (CIO)', 'In Progress', '2026-02-05 10:15:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(136, 'DOC-10018', 'CIO Head', 'Department Head', 'Signed', '2026-02-05 11:00:00', 'ri-pen-nib-fill', 'Equipment list approved', NULL, NULL),
(137, 'DOC-10018', 'CIO Head', 'City Information Office (CIO)', 'Transferred', '2026-02-05 11:01:00', 'ri-share-forward-fill', 'Transferred to City Budget Office (CBO).', NULL, NULL),
(138, 'DOC-10018', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-02-06 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(139, 'DOC-10019', 'CAO Head', 'Department Head', 'Document Created', '2026-02-06 11:00:00', 'ri-upload-cloud-line', 'Office supplies fund replenishment', NULL, NULL),
(140, 'DOC-10020', 'CPO Head', 'Department Head', 'Document Created', '2026-02-03 08:30:00', 'ri-upload-cloud-line', 'Vehicle fleet maintenance procurement', NULL, NULL),
(141, 'DOC-10020', 'CPO Head', 'City Procurement Office (CPO)', 'In Progress', '2026-02-03 08:45:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(142, 'DOC-10020', 'CPO Head', 'Department Head', 'Signed', '2026-02-03 10:00:00', 'ri-pen-nib-fill', 'Procurement approved', NULL, NULL),
(143, 'DOC-10020', 'CPO Head', 'City Procurement Office (CPO)', 'Transferred', '2026-02-03 10:01:00', 'ri-share-forward-fill', 'Transferred to City Budget Office (CBO).', NULL, NULL),
(144, 'DOC-10020', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-02-04 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(145, 'DOC-10020', 'CBO Head', 'Department Head', 'Signed', '2026-02-04 13:00:00', 'ri-pen-nib-fill', 'Budget approved', NULL, NULL),
(146, 'DOC-10020', 'CBO Head', 'City Budget Office (CBO)', 'Transferred', '2026-02-04 13:01:00', 'ri-share-forward-fill', 'Transferred to Office of the City Mayor (OCM).', NULL, NULL),
(147, 'DOC-10020', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-02-05 08:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(148, 'DOC-10016', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-06 23:45:25', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(149, 'DOC-10020', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-06 23:45:26', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(150, 'DOC-10004', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-06 23:45:29', 'ri-eye-line', 'Duration: 2s', NULL, NULL),
(151, 'DOC-10015', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-06 23:45:31', 'ri-eye-line', 'Duration: 2s', NULL, NULL),
(152, 'DOC-10017', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-02-06 23:45:38', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(153, 'DOC-10017', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-06 23:45:39', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(154, 'DOC-10017', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-06 23:46:35', 'ri-eye-line', 'Duration: 29s', NULL, NULL),
(155, 'DOC-10017', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-06 23:46:43', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(156, 'DOC-10013', 'CTO Head', 'City Treasury Office (CTO)', 'Viewed', '2026-02-06 23:46:53', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(157, 'DOC-10013', 'CTO Head', 'City Treasury Office (CTO)', 'Viewed', '2026-02-06 23:46:56', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(158, 'DOC-99275', 'CTO Head', 'City Treasury Office (CTO)', 'Viewed', '2026-02-06 23:47:00', 'ri-eye-line', 'Duration: 2s', NULL, NULL),
(159, 'DOC-99275', 'CTO Head', 'City Treasury Office (CTO)', 'Viewed', '2026-02-06 23:47:08', 'ri-eye-line', 'Duration: 2s', NULL, NULL),
(160, 'DOC-99275', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-06 23:47:35', 'ri-eye-line', 'Duration: 4s', NULL, NULL),
(161, 'DOC-10011', 'CBO Head', 'City Budget Office (CBO)', 'Viewed', '2026-02-06 23:48:17', 'ri-eye-line', 'Duration: 2s', NULL, NULL),
(162, 'DOC-10018', 'CBO Head', 'City Budget Office (CBO)', 'Viewed', '2026-02-06 23:48:19', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(163, 'DOC-20241', 'CBO Head', 'Department Head', 'Document Created', '2026-01-15 09:00:00', 'ri-upload-cloud-line', 'FY 2026 budget ordinance submitted', NULL, NULL),
(164, 'DOC-20241', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-01-15 09:15:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(165, 'DOC-20241', 'CBO Head', 'Department Head', 'Signed', '2026-01-15 10:30:00', 'ri-pen-nib-fill', 'Budget breakdown verified and approved', NULL, NULL),
(166, 'DOC-20241', 'CBO Head', 'City Budget Office (CBO)', 'Transferred', '2026-01-15 10:31:00', 'ri-share-forward-fill', 'Transferred to City Treasury Office (CTO).', NULL, NULL),
(167, 'DOC-20241', 'CTO Head', 'City Treasury Office (CTO)', 'In Progress', '2026-01-16 08:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(168, 'DOC-20241', 'CTO Head', 'Department Head', 'Signed', '2026-01-16 11:00:00', 'ri-pen-nib-fill', 'Fund allocation confirmed and treasury approved', NULL, NULL),
(169, 'DOC-20241', 'CTO Head', 'City Treasury Office (CTO)', 'Transferred', '2026-01-16 11:01:00', 'ri-share-forward-fill', 'Transferred to Office of the City Mayor (OCM).', NULL, NULL),
(170, 'DOC-20241', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-01-17 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(171, 'DOC-20241', 'OCM Head', 'Department Head', 'Signed', '2026-01-17 10:00:00', 'ri-pen-nib-fill', 'Budget ordinance approved by City Mayor', NULL, NULL),
(172, 'DOC-20241', 'OCM Head', 'Office of the City Mayor (OCM)', 'Transferred', '2026-01-17 10:01:00', 'ri-share-forward-fill', 'Document Completed (Ready for Archiving).', NULL, NULL),
(173, 'DOC-20242', 'CBO Head', 'Department Head', 'Document Created', '2026-02-04 10:00:00', 'ri-upload-cloud-line', 'Q1 cash advance request', NULL, NULL),
(174, 'DOC-20242', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-02-04 10:15:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(175, 'DOC-20242', 'CBO Head', 'Department Head', 'Signed', '2026-02-04 11:00:00', 'ri-pen-nib-fill', 'Cash advance computation verified', NULL, NULL),
(176, 'DOC-20242', 'CBO Head', 'City Budget Office (CBO)', 'Transferred', '2026-02-04 11:01:00', 'ri-share-forward-fill', 'Transferred to City Treasury Office (CTO).', NULL, NULL),
(177, 'DOC-20242', 'CTO Head', 'City Treasury Office (CTO)', 'In Progress', '2026-02-05 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(178, 'DOC-20243', 'CTO Head', 'Department Head', 'Document Created', '2026-02-06 08:00:00', 'ri-upload-cloud-line', 'January revenue report submission', NULL, NULL),
(179, 'DOC-20244', 'Budget Head Zedryl', 'Department Head', 'Document Created', '2026-02-03 08:00:00', 'ri-upload-cloud-line', 'Emergency supplemental budget request', NULL, NULL),
(180, 'DOC-20244', 'Budget Head Zedryl', 'City Budget Office (CBO)', 'In Progress', '2026-02-03 08:20:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(181, 'DOC-20244', 'Budget Head Zedryl', 'Department Head', 'Signed', '2026-02-03 09:30:00', 'ri-pen-nib-fill', 'Supplemental budget approved by CBO', NULL, NULL),
(182, 'DOC-20244', 'Budget Head Zedryl', 'City Budget Office (CBO)', 'Transferred', '2026-02-03 09:31:00', 'ri-share-forward-fill', 'Transferred to City Treasury Office (CTO).', NULL, NULL),
(183, 'DOC-20244', 'CTO Head', 'City Treasury Office (CTO)', 'In Progress', '2026-02-04 10:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(184, 'DOC-20244', 'CTO Head', 'Department Head', 'Signed', '2026-02-04 14:00:00', 'ri-pen-nib-fill', 'Fund availability confirmed', NULL, NULL),
(185, 'DOC-20244', 'CTO Head', 'City Treasury Office (CTO)', 'Transferred', '2026-02-04 14:01:00', 'ri-share-forward-fill', 'Transferred to Office of the City Mayor (OCM).', NULL, NULL),
(186, 'DOC-20244', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-02-05 08:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(187, 'DOC-20245', 'OCM Head', 'Department Head', 'Document Created', '2026-02-06 09:30:00', 'ri-upload-cloud-line', 'Special project fund request from Mayor', NULL, NULL),
(188, 'DOC-20246', 'Mayor Lashawn', 'Department Head', 'Document Created', '2026-01-28 10:00:00', 'ri-upload-cloud-line', 'Honorarium payment authorization', NULL, NULL),
(189, 'DOC-20246', 'Mayor Lashawn', 'Office of the City Mayor (OCM)', 'In Progress', '2026-01-28 10:15:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(190, 'DOC-20246', 'Mayor Lashawn', 'Department Head', 'Signed', '2026-01-28 11:00:00', 'ri-pen-nib-fill', 'Payment authorized by Mayor', NULL, NULL),
(191, 'DOC-20246', 'Mayor Lashawn', 'Office of the City Mayor (OCM)', 'Transferred', '2026-01-28 11:01:00', 'ri-share-forward-fill', 'Transferred to City Budget Office (CBO).', NULL, NULL),
(192, 'DOC-20246', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-01-29 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(193, 'DOC-20246', 'CBO Head', 'Department Head', 'Signed', '2026-01-29 11:00:00', 'ri-pen-nib-fill', 'Budget allocation verified', NULL, NULL),
(194, 'DOC-20246', 'CBO Head', 'City Budget Office (CBO)', 'Transferred', '2026-01-29 11:01:00', 'ri-share-forward-fill', 'Transferred to City Treasury Office (CTO).', NULL, NULL),
(195, 'DOC-20246', 'CTO Merwin Head', 'City Treasury Office (CTO)', 'In Progress', '2026-01-30 08:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(196, 'DOC-20246', 'CTO Merwin Head', 'Department Head', 'Signed', '2026-01-30 10:00:00', 'ri-pen-nib-fill', 'Payment processed and released', NULL, NULL),
(197, 'DOC-20246', 'CTO Merwin Head', 'City Treasury Office (CTO)', 'Transferred', '2026-01-30 10:01:00', 'ri-share-forward-fill', 'Document Completed (Ready for Archiving).', NULL, NULL),
(198, 'DOC-20247', 'Budget Head Zedryl', 'Department Head', 'Document Created', '2026-02-05 14:00:00', 'ri-upload-cloud-line', 'February utility bills payment request', NULL, NULL),
(199, 'DOC-20247', 'Budget Head Zedryl', 'City Budget Office (CBO)', 'In Progress', '2026-02-05 14:20:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(200, 'DOC-20247', 'Budget Head Zedryl', 'Department Head', 'Signed', '2026-02-05 15:00:00', 'ri-pen-nib-fill', 'Utility bills verified', NULL, NULL),
(201, 'DOC-20247', 'Budget Head Zedryl', 'City Budget Office (CBO)', 'Transferred', '2026-02-05 15:01:00', 'ri-share-forward-fill', 'Transferred to City Treasury Office (CTO).', NULL, NULL),
(202, 'DOC-20247', 'CTO Head', 'City Treasury Office (CTO)', 'In Progress', '2026-02-06 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(203, 'DOC-20248', 'CBO Head', 'Department Head', 'Document Created', '2026-02-06 10:30:00', 'ri-upload-cloud-line', 'Salary differential payment request', NULL, NULL),
(204, 'DOC-20249', 'CBO Head', 'Department Head', 'Document Created', '2026-01-10 09:00:00', 'ri-upload-cloud-line', 'December budget utilization report', NULL, NULL),
(205, 'DOC-20249', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-01-10 09:30:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(206, 'DOC-20249', 'CBO Head', 'Department Head', 'Signed', '2026-01-10 11:00:00', 'ri-pen-nib-fill', 'Budget report finalized', NULL, NULL),
(207, 'DOC-20249', 'CBO Head', 'City Budget Office (CBO)', 'Transferred', '2026-01-10 11:01:00', 'ri-share-forward-fill', 'Transferred to Office of the City Mayor (OCM).', NULL, NULL),
(208, 'DOC-20249', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-01-11 08:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(209, 'DOC-20249', 'OCM Head', 'Department Head', 'Signed', '2026-01-11 09:00:00', 'ri-pen-nib-fill', 'Budget report reviewed and noted', NULL, NULL),
(210, 'DOC-20249', 'OCM Head', 'Office of the City Mayor (OCM)', 'Transferred', '2026-01-11 09:01:00', 'ri-share-forward-fill', 'Document Completed (Ready for Archiving).', NULL, NULL),
(211, 'DOC-20250', 'CTO Merwin Head', 'Department Head', 'Document Created', '2026-02-06 11:00:00', 'ri-upload-cloud-line', '2025 Annual income statement', NULL, NULL),
(212, 'DOC-20251', 'Budget Head Zedryl', 'Department Head', 'Document Created', '2026-02-05 09:00:00', 'ri-upload-cloud-line', 'Budget clearance for retirement', NULL, NULL),
(213, 'DOC-20251', 'Budget Head Zedryl', 'City Budget Office (CBO)', 'In Progress', '2026-02-05 09:15:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(214, 'DOC-20251', 'Budget Head Zedryl', 'Department Head', 'Signed', '2026-02-05 10:00:00', 'ri-pen-nib-fill', 'Budget clearance issued', NULL, NULL),
(215, 'DOC-20251', 'Budget Head Zedryl', 'City Budget Office (CBO)', 'Transferred', '2026-02-05 10:01:00', 'ri-share-forward-fill', 'Transferred to City Human Resource Management Office (CHRMO).', NULL, NULL),
(216, 'DOC-20251', 'CHRMO Head', 'City Human Resource Management Office (CHRMO)', 'In Progress', '2026-02-06 10:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(217, 'DOC-20252', 'CBO Head', 'Department Head', 'Document Created', '2026-02-06 13:00:00', 'ri-upload-cloud-line', 'Budget compliance certification', NULL, NULL),
(218, 'DOC-20253', 'CBO Head', 'Department Head', 'Document Created', '2026-02-01 08:00:00', 'ri-upload-cloud-line', 'January budget performance report', NULL, NULL),
(219, 'DOC-20253', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-02-01 08:30:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(220, 'DOC-20253', 'CBO Head', 'Department Head', 'Signed', '2026-02-01 10:00:00', 'ri-pen-nib-fill', 'Report finalized', NULL, NULL),
(221, 'DOC-20253', 'CBO Head', 'City Budget Office (CBO)', 'Transferred', '2026-02-01 10:01:00', 'ri-share-forward-fill', 'Transferred to City Administrator Office (CAO).', NULL, NULL),
(222, 'DOC-20253', 'CAO Head', 'City Administrator Office (CAO)', 'In Progress', '2026-02-02 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(223, 'DOC-20253', 'CAO Head', 'Department Head', 'Signed', '2026-02-02 11:00:00', 'ri-pen-nib-fill', 'Report reviewed and noted', NULL, NULL),
(224, 'DOC-20253', 'CAO Head', 'City Administrator Office (CAO)', 'Transferred', '2026-02-02 11:01:00', 'ri-share-forward-fill', 'Document Completed (Ready for Archiving).', NULL, NULL),
(225, 'DOC-20254', 'CTO Merwin Head', 'Department Head', 'Document Created', '2026-02-04 11:00:00', 'ri-upload-cloud-line', 'Business tax collection report', NULL, NULL),
(226, 'DOC-20254', 'CTO Merwin Head', 'City Treasury Office (CTO)', 'In Progress', '2026-02-04 11:20:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(227, 'DOC-20254', 'CTO Merwin Head', 'Department Head', 'Signed', '2026-02-04 12:00:00', 'ri-pen-nib-fill', 'Collection summary verified', NULL, NULL),
(228, 'DOC-20254', 'CTO Merwin Head', 'City Treasury Office (CTO)', 'Transferred', '2026-02-04 12:01:00', 'ri-share-forward-fill', 'Transferred to Business Permit and Licensing Office (BPLO).', NULL, NULL),
(229, 'DOC-20254', 'BPLO Head', 'Business Permit and Licensing Office (BPLO)', 'In Progress', '2026-02-05 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(230, 'DOC-20255', 'CTO Head', 'Department Head', 'Document Created', '2026-02-06 14:00:00', 'ri-upload-cloud-line', 'Weekly cash position report', NULL, NULL),
(231, 'DOC-20256', 'CTO Head', 'Department Head', 'Document Created', '2026-01-25 10:00:00', 'ri-upload-cloud-line', 'Market rental payment confirmation', NULL, NULL),
(232, 'DOC-20256', 'CTO Head', 'City Treasury Office (CTO)', 'In Progress', '2026-01-25 10:15:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(233, 'DOC-20256', 'CTO Head', 'Department Head', 'Signed', '2026-01-25 11:00:00', 'ri-pen-nib-fill', 'Payment records verified', NULL, NULL),
(234, 'DOC-20256', 'CTO Head', 'City Treasury Office (CTO)', 'Transferred', '2026-01-25 11:01:00', 'ri-share-forward-fill', 'Transferred to City Public Market Office (CPMO).', NULL, NULL),
(235, 'DOC-20256', 'CPMO Head', 'City Public Market Office (CPMO)', 'In Progress', '2026-01-26 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(236, 'DOC-20256', 'CPMO Head', 'Department Head', 'Signed', '2026-01-26 10:00:00', 'ri-pen-nib-fill', 'Rental records reconciled', NULL, NULL),
(237, 'DOC-20256', 'CPMO Head', 'City Public Market Office (CPMO)', 'Transferred', '2026-01-26 10:01:00', 'ri-share-forward-fill', 'Document Completed (Ready for Archiving).', NULL, NULL),
(238, 'DOC-20257', 'OCM Head', 'Department Head', 'Document Created', '2026-02-05 08:00:00', 'ri-upload-cloud-line', 'Work-from-home policy memorandum', NULL, NULL),
(239, 'DOC-20257', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-02-05 08:15:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(240, 'DOC-20257', 'OCM Head', 'Department Head', 'Signed', '2026-02-05 09:00:00', 'ri-pen-nib-fill', 'Memorandum signed by Mayor', NULL, NULL),
(241, 'DOC-20257', 'OCM Head', 'Office of the City Mayor (OCM)', 'Transferred', '2026-02-05 09:01:00', 'ri-share-forward-fill', 'Transferred to City Administrator Office (CAO).', NULL, NULL),
(242, 'DOC-20257', 'CAO Head', 'City Administrator Office (CAO)', 'In Progress', '2026-02-06 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(243, 'DOC-20258', 'Mayor Lashawn', 'Department Head', 'Document Created', '2026-02-06 15:00:00', 'ri-upload-cloud-line', 'Special order for event coverage', NULL, NULL),
(244, 'DOC-20259', 'OCM Head', 'Department Head', 'Document Created', '2026-01-18 09:00:00', 'ri-upload-cloud-line', 'Executive order for traffic task force', NULL, NULL),
(245, 'DOC-20259', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-01-18 09:30:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(246, 'DOC-20259', 'OCM Head', 'Department Head', 'Signed', '2026-01-18 10:00:00', 'ri-pen-nib-fill', 'Executive order signed by Mayor', NULL, NULL),
(247, 'DOC-20259', 'OCM Head', 'Office of the City Mayor (OCM)', 'Transferred', '2026-01-18 10:01:00', 'ri-share-forward-fill', 'Transferred to City Legal Office (CLO).', NULL, NULL),
(248, 'DOC-20259', 'CLO Head', 'City Legal Office (CLO)', 'In Progress', '2026-01-19 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(249, 'DOC-20259', 'CLO Head', 'Department Head', 'Signed', '2026-01-19 11:00:00', 'ri-pen-nib-fill', 'Legal review completed', NULL, NULL),
(250, 'DOC-20259', 'CLO Head', 'City Legal Office (CLO)', 'Transferred', '2026-01-19 11:01:00', 'ri-share-forward-fill', 'Transferred to City Information Office (CIO).', NULL, NULL),
(251, 'DOC-20259', 'CIO Head', 'City Information Office (CIO)', 'In Progress', '2026-01-20 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(252, 'DOC-20259', 'CIO Head', 'Department Head', 'Signed', '2026-01-20 10:00:00', 'ri-pen-nib-fill', 'Prepared for public dissemination', NULL, NULL),
(253, 'DOC-20259', 'CIO Head', 'City Information Office (CIO)', 'Transferred', '2026-01-20 10:01:00', 'ri-share-forward-fill', 'Document Completed (Ready for Archiving).', NULL, NULL),
(254, 'DOC-20260', 'CHRMO Head', 'Department Head', 'Document Created', '2026-02-06 16:00:00', 'ri-upload-cloud-line', 'Employee training budget request', NULL, NULL),
(255, 'DOC-20261', 'CPO Head', 'Department Head', 'Document Created', '2026-02-05 11:00:00', 'ri-upload-cloud-line', 'AC units procurement request', NULL, NULL),
(256, 'DOC-20261', 'CPO Head', 'City Procurement Office (CPO)', 'In Progress', '2026-02-05 11:20:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(257, 'DOC-20261', 'CPO Head', 'Department Head', 'Signed', '2026-02-05 12:00:00', 'ri-pen-nib-fill', 'Procurement specifications approved', NULL, NULL),
(258, 'DOC-20261', 'CPO Head', 'City Procurement Office (CPO)', 'Transferred', '2026-02-05 12:01:00', 'ri-share-forward-fill', 'Transferred to City Budget Office (CBO).', NULL, NULL),
(259, 'DOC-20261', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-02-06 10:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(260, 'DOC-20262', 'BPLO Head', 'Department Head', 'Document Created', '2026-02-07 08:00:00', 'ri-upload-cloud-line', 'Permit payment verification request', NULL, NULL),
(261, 'DOC-20263', 'CPMO Head', 'Department Head', 'Document Created', '2026-02-03 09:00:00', 'ri-upload-cloud-line', 'Market revenue remittance', NULL, NULL),
(262, 'DOC-20263', 'CPMO Head', 'City Public Market Office (CPMO)', 'In Progress', '2026-02-03 09:20:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(263, 'DOC-20263', 'CPMO Head', 'Department Head', 'Signed', '2026-02-03 10:00:00', 'ri-pen-nib-fill', 'Revenue records verified', NULL, NULL),
(264, 'DOC-20263', 'CPMO Head', 'City Public Market Office (CPMO)', 'Transferred', '2026-02-03 10:01:00', 'ri-share-forward-fill', 'Transferred to City Budget Office (CBO).', NULL, NULL),
(265, 'DOC-20263', 'CBO Head', 'City Budget Office (CBO)', 'In Progress', '2026-02-04 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(266, 'DOC-20263', 'CBO Head', 'Department Head', 'Signed', '2026-02-04 11:00:00', 'ri-pen-nib-fill', 'Revenue allocation verified', NULL, NULL),
(267, 'DOC-20263', 'CBO Head', 'City Budget Office (CBO)', 'Transferred', '2026-02-04 11:01:00', 'ri-share-forward-fill', 'Transferred to City Treasury Office (CTO).', NULL, NULL),
(268, 'DOC-20263', 'CTO Head', 'City Treasury Office (CTO)', 'In Progress', '2026-02-05 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(269, 'DOC-20264', 'CAO Head', 'Department Head', 'Document Created', '2026-02-07 09:00:00', 'ri-upload-cloud-line', 'Office inspection report submission', NULL, NULL),
(270, 'DOC-20265', 'CLO Head', 'Department Head', 'Document Created', '2026-02-04 08:00:00', 'ri-upload-cloud-line', 'Health ordinance draft', NULL, NULL),
(271, 'DOC-20265', 'CLO Head', 'City Legal Office (CLO)', 'In Progress', '2026-02-04 08:20:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(272, 'DOC-20265', 'CLO Head', 'Department Head', 'Signed', '2026-02-04 10:00:00', 'ri-pen-nib-fill', 'Legal drafting completed', NULL, NULL),
(273, 'DOC-20265', 'CLO Head', 'City Legal Office (CLO)', 'Transferred', '2026-02-04 10:01:00', 'ri-share-forward-fill', 'Transferred to City Information Office (CIO).', NULL, NULL),
(274, 'DOC-20265', 'CIO Head', 'City Information Office (CIO)', 'In Progress', '2026-02-05 09:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(275, 'DOC-20265', 'CIO Head', 'Department Head', 'Signed', '2026-02-05 11:00:00', 'ri-pen-nib-fill', 'Public information review completed', NULL, NULL),
(276, 'DOC-20265', 'CIO Head', 'City Information Office (CIO)', 'Transferred', '2026-02-05 11:01:00', 'ri-share-forward-fill', 'Transferred to Office of the City Mayor (OCM).', NULL, NULL),
(277, 'DOC-20265', 'OCM Head', 'Office of the City Mayor (OCM)', 'In Progress', '2026-02-06 08:00:00', 'ri-loader-4-line', 'Note: Opened by Department Head', NULL, NULL),
(278, 'DOC-20264', 'System Admin', 'City Management Information Division (CMISD)', 'Viewed', '2026-02-07 17:18:04', 'ri-eye-line', 'Duration: 6s', NULL, NULL),
(279, 'DOC-10017', 'System Admin', 'City Management Information Division (CMISD)', 'Viewed', '2026-02-07 17:18:08', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(280, 'DOC-10017', 'System Admin', 'City Management Information Division (CMISD)', 'Viewed', '2026-02-07 17:18:09', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(281, 'DOC-20264', 'System Admin', 'City Management Information Division (CMISD)', 'Viewed', '2026-02-07 17:23:28', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(282, 'DOC-99275', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 17:28:02', 'ri-eye-line', 'Duration: 26s', NULL, NULL),
(283, 'DOC-20253', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 17:28:15', 'ri-eye-line', 'Duration: 2s', NULL, NULL),
(284, 'DOC-99275', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 17:28:19', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(285, 'DOC-10001', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 17:29:26', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(286, 'DOC-10001', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 17:32:51', 'ri-eye-line', 'Duration: 2s', NULL, NULL),
(287, 'DOC-99275', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 17:33:13', 'ri-eye-line', 'Duration: 18s', NULL, NULL),
(288, 'DOC-99275', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 17:34:30', 'ri-eye-line', 'Duration: 1m 7s', NULL, NULL),
(289, 'DOC-10001', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 17:34:34', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(290, 'DOC-10001', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 17:35:44', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(291, 'DOC-10005', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 17:35:51', 'ri-eye-line', 'Duration: 4s', NULL, NULL),
(292, 'DOC-10001', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 17:36:01', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(293, 'DOC-10001', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 17:38:59', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(294, 'DOC-10017', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 18:09:33', 'ri-eye-line', 'Duration: 4s', NULL, NULL),
(295, 'DOC-20258', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 18:09:38', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(296, 'DOC-10017', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 18:09:44', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(297, 'DOC-10020', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 18:09:46', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(298, 'DOC-10015', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 18:09:47', 'ri-eye-line', 'Duration: 1s', NULL, NULL),
(299, 'DOC-20245', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 18:35:14', 'ri-eye-line', 'Duration: 6s', NULL, NULL),
(300, 'DOC-20245', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 18:35:18', 'ri-eye-line', 'Duration: 2s', NULL, NULL),
(301, 'DOC-20245', 'OCM Head', 'Office of the City Mayor (OCM)', 'Viewed', '2026-02-07 18:37:02', 'ri-eye-line', 'Duration: 1s', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `fixed_routes`
--

CREATE TABLE `fixed_routes` (
  `id` int(11) NOT NULL,
  `category` varchar(100) NOT NULL,
  `route_sequence` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fixed_routes`
--

INSERT INTO `fixed_routes` (`id`, `category`, `route_sequence`, `updated_at`) VALUES
(1, 'Budget Request', '[\"City Budget Office (CBO)\", \"City Treasury Office (CTO)\", \"Office of the City Mayor (OCM)\"]', '2026-02-03 03:29:11'),
(2, 'Legal Review', '[\"City Legal Office (CLO)\", \"City Information Office (CIO)\", \"Office of the City Mayor (OCM)\"]', '2026-02-03 03:29:11'),
(3, 'Personnel Action', '[\"City Human Resource Management Office (CHRMO)\", \"City Legal Office (CLO)\", \"Office of the City Mayor (OCM)\"]', '2026-02-03 03:29:11'),
(4, 'Business License', '[\"Business Permit and Licensing Office (BPLO)\", \"City Treasury Office (CTO)\", \"City Management Information Division (CMISD)\"]', '2026-02-03 03:29:11'),
(5, 'Purchase Order', '[\"City Procurement Office (CPO)\", \"City Budget Office (CBO)\", \"Office of the City Mayor (OCM)\"]', '2026-02-03 03:29:11'),
(7, 'Request Letter', '[\"City Human Resource Management Office (CHRMO)\",\"City Administrator Office (CAO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-03 07:30:31'),
(8, 'Proposal', '[\"City Administrator Office (CAO)\",\"City Budget Office (CBO)\",\"City Administrator Office (CAO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-03 07:32:11'),
(11, 'Memorandum', '[\"Office of the City Mayor (OCM)\",\"City Administrator Office (CAO)\",\"City Human Resource Management Office (CHRMO)\"]', '2026-02-06 15:51:08'),
(12, 'Travel Order', '[\"City Human Resource Management Office (CHRMO)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(13, 'Leave Application', '[\"City Human Resource Management Office (CHRMO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(14, 'Payment Request', '[\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\"]', '2026-02-06 15:51:08'),
(15, 'Disbursement Voucher', '[\"City Budget Office (CBO)\",\"City Treasury Office (CTO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(16, 'Contract Agreement', '[\"City Legal Office (CLO)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(17, 'Resolution', '[\"City Legal Office (CLO)\",\"City Information Office (CIO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(18, 'Ordinance', '[\"City Legal Office (CLO)\",\"City Information Office (CIO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(19, 'Inspection Report', '[\"City Administrator Office (CAO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(20, 'Project Proposal', '[\"City Administrator Office (CAO)\",\"City Budget Office (CBO)\",\"City Procurement Office (CPO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(21, 'Job Order Request', '[\"City Human Resource Management Office (CHRMO)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(22, 'Permit Application', '[\"Business Permit and Licensing Office (BPLO)\",\"City Treasury Office (CTO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(23, 'Barangay Endorsement', '[\"City Administrator Office (CAO)\",\"City Legal Office (CLO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(24, 'Procurement Plan', '[\"City Procurement Office (CPO)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(25, 'Training Request', '[\"City Human Resource Management Office (CHRMO)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(26, 'Equipment Request', '[\"City Procurement Office (CPO)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(27, 'Audit Report', '[\"City Administrator Office (CAO)\",\"City Budget Office (CBO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(28, 'Notice of Award', '[\"City Procurement Office (CPO)\",\"City Legal Office (CLO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(29, 'Performance Evaluation', '[\"City Human Resource Management Office (CHRMO)\",\"Office of the City Mayor (OCM)\"]', '2026-02-06 15:51:08'),
(30, 'Special Order', '[\"Office of the City Mayor (OCM)\",\"City Information Office (CIO)\"]', '2026-02-06 15:51:08');

-- --------------------------------------------------------

--
-- Table structure for table `memos`
--

CREATE TABLE `memos` (
  `id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT 'Announcement',
  `ref_no` varchar(50) DEFAULT NULL,
  `created_by` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `attachment` varchar(255) DEFAULT NULL,
  `target_audience` varchar(255) DEFAULT 'All',
  `duration_days` int(11) DEFAULT 7,
  `archive_status` enum('active','expired','deleted') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `memos`
--

INSERT INTO `memos` (`id`, `title`, `message`, `type`, `ref_no`, `created_by`, `created_at`, `attachment`, `target_audience`, `duration_days`, `archive_status`) VALUES
(1, 'Implementation of New Document Tracking System', 'All city government employees are hereby informed that the new Document Tracking System is now fully operational. All document submissions must be done through the online platform starting February 1, 2026. Training sessions will be conducted for all departments. For assistance, please contact CMISD.', 'Announcement', 'MEMO-2026-001', 'OCM Head', '2026-01-15 09:00:00', '../assets/uploads/dummy_propose-letter.pdf', 'All', 30, 'active'),
(2, 'Urgent: Year-End Financial Report Deadline', 'URGENT REMINDER: All financial reports for FY 2025 must be submitted to the City Budget Office not later than January 31, 2026. Late submissions will be subject to sanctions. Please coordinate with your respective accounting officers immediately.', 'Urgent', 'MEMO-2026-002', 'CBO Head', '2026-01-20 10:00:00', NULL, 'City Budget Office (CBO),City Treasury Office (CTO),Office of the City Mayor (OCM)', 15, 'expired'),
(3, 'Holiday Notice - EDSA People Power Revolution', 'This is to inform everyone that February 25, 2026 (Tuesday) is a regular holiday in commemoration of the EDSA People Power Revolution. All city offices will be closed. Essential services will continue to operate with skeletal workforce. Enjoy the long weekend!', 'Holiday', 'MEMO-2026-003', 'CHRMO Head', '2026-02-10 08:00:00', '../assets/uploads/dummy_propose-letter.pdf', 'All', 20, 'active'),
(4, 'Business Permit Renewal Extension Period', 'The deadline for business permit renewal has been extended until March 31, 2026. Business owners are encouraged to renew early to avoid penalties. Online renewal is now available through the city portal. For inquiries, contact BPLO office.', 'Announcement', 'MEMO-2026-004', 'BPLO Head', '2026-02-01 11:00:00', NULL, 'Business Permit and Licensing Office (BPLO),City Treasury Office (CTO)', 45, 'active'),
(5, 'Mandatory Attendance: Emergency Preparedness Drill', 'MANDATORY NOTICE: An emergency preparedness drill will be conducted on February 15, 2026 at 2:00 PM. ALL employees are required to participate. Department heads must submit attendance reports immediately after the drill. Non-compliance will be dealt with accordingly.', 'Urgent', 'MEMO-2026-005', 'CAO Head', '2026-02-05 09:00:00', '../assets/uploads/dummy_propose-letter.pdf', 'All', 10, 'active'),
(6, 'Performance Evaluation Schedule for FY 2025', 'The performance evaluation for all regular employees covering FY 2025 will be conducted from February 10-28, 2026. Department heads are requested to submit Individual Performance Commitment and Review Forms (IPCRF) to CHRMO not later than March 5, 2026. Evaluation results will be the basis for merit increases and promotions.', 'Announcement', 'MEMO-2026-006', 'CHRMO Head', '2026-02-03 13:00:00', NULL, 'City Human Resource Management Office (CHRMO),Office of the City Mayor (OCM),City Administrator Office (CAO)', 25, 'active'),
(7, 'Special Non-Working Day - City Fiesta Celebration', 'In celebration of the annual fiesta of Sto. Tomas, March 7, 2026 (Friday) is declared a special non-working day for all city government employees. The Palarong Bayan and other festivities will be held at the City Plaza. All employees are encouraged to participate in the celebration.', 'Holiday', 'MEMO-2026-007', 'OCM Head', '2026-02-20 10:00:00', NULL, 'All', 30, 'active'),
(8, 'New Guidelines on Procurement Process', 'Updated procurement guidelines in compliance with RA 9184 are now in effect. All procurement activities must follow the new bidding procedures and documentation requirements. A copy of the updated guidelines is attached. Procurement officers are required to attend orientation on February 12, 2026.', 'Announcement', 'MEMO-2026-008', 'CPO Head', '2026-02-04 14:00:00', '../assets/uploads/dummy_propose-letter.pdf', 'City Budget Office (CBO),City Procurement Office (CPO),City Treasury Office (CTO)', 60, 'active'),
(9, 'Critical: System Maintenance and Backup', 'URGENT NOTICE: The city server will undergo critical maintenance on February 8, 2026 from 6:00 PM to 12:00 MN. All systems including email, document tracking, and online services will be temporarily unavailable. Please save all work and log out before 5:30 PM. Online transactions will resume on February 9, 2026 at 8:00 AM.', 'Urgent', 'MEMO-2026-009', 'CMISD Head', '2026-02-06 15:00:00', NULL, 'All', 5, 'active'),
(10, 'Health and Wellness Program for Employees', 'The City Health Office in coordination with CHRMO is launching a comprehensive health and wellness program for all city government employees. Free medical check-ups, fitness activities, and mental health consultations are available. Registration forms are attached. Schedule your appointment through the CHRMO office.', 'Announcement', 'MEMO-2026-010', 'CHRMO Head', '2026-01-25 09:00:00', '../assets/uploads/dummy_propose-letter.pdf', 'All', 90, 'active'),
(11, 'Immediate Action Required: Social Media Policy Compliance', 'All employees are reminded to strictly comply with the social media policy. Unauthorized posting of confidential government information is strictly prohibited. Recent violations have been reported and are under investigation. Department heads must brief their respective staff immediately. Non-compliance may result in disciplinary action.', 'Urgent', 'MEMO-2026-011', 'CIO Head', '2026-02-05 11:00:00', NULL, 'City Information Office (CIO),Office of the City Mayor (OCM)', 15, 'active'),
(12, 'Maundy Thursday and Good Friday Holiday Notice', 'In observance of Holy Week 2026, April 17 (Thursday) and April 18 (Friday) are regular holidays. City offices will be closed. Emergency and essential services will be available with skeleton staff. Regular operations will resume on April 21 (Monday). Advanced Happy Easter to everyone!', 'Holiday', 'MEMO-2026-012', 'OCM Head', '2026-03-15 08:00:00', '../assets/uploads/dummy_propose-letter.pdf', 'All', 60, 'active'),
(13, 'Updated Guidelines on Business Permit Requirements', 'The City Legal Office has reviewed and updated the requirements for business permit applications. The new checklist includes additional documentary requirements for food establishments and environmental compliance certificates. All pending applications must comply with the new requirements. Effectivity: March 1, 2026.', 'Announcement', 'MEMO-2026-013', 'CLO Head', '2026-02-08 10:00:00', NULL, 'City Legal Office (CLO),Business Permit and Licensing Office (BPLO),City Administrator Office (CAO)', 45, 'active'),
(14, 'Immediate Submission: Revenue Collection Reports', 'URGENT: All revenue collection reports for January 2026 must be submitted to the City Treasurer not later than February 10, 2026 at 5:00 PM. This is critical for the monthly financial statement preparation. Attached is the revised reporting template. Late submissions will be noted in the monthly performance report.', 'Urgent', 'MEMO-2026-014', 'CTO Head', '2026-02-07 08:00:00', '../assets/uploads/dummy_propose-letter.pdf', 'City Treasury Office (CTO),City Budget Office (CBO)', 7, 'active'),
(15, 'Work-From-Home Arrangement Guidelines', 'In line with the flexible work arrangement program, qualified employees may now apply for work-from-home setup on specific days. Employees must submit applications to their department heads for approval. Criteria include nature of work, equipment availability, and performance rating. Approved applications are valid for 3 months and subject to review.', 'Announcement', 'MEMO-2026-015', 'CHRMO Head', '2026-01-30 14:00:00', NULL, 'All', 90, 'active'),
(16, 'Christmas Party and Year-End Celebration 2025', 'All employees are invited to the annual Christmas party on December 20, 2025 at 4:00 PM at the City Hall Function Room. Attendance is encouraged. Bring your families! Merry Christmas and Happy New Year!', 'Holiday', 'MEMO-2025-099', 'OCM Head', '2025-12-05 09:00:00', NULL, 'All', 15, 'expired'),
(17, '[CANCELLED] Emergency Meeting Postponed', 'The emergency meeting scheduled for January 10 has been cancelled due to unforeseen circumstances. A new schedule will be announced later. Please disregard previous notices.', 'Urgent', 'MEMO-2026-VOID', 'CAO Head', '2026-01-09 16:00:00', NULL, 'All', 5, 'deleted');

-- --------------------------------------------------------

--
-- Table structure for table `memo_views`
--

CREATE TABLE `memo_views` (
  `id` int(11) NOT NULL,
  `memo_id` int(11) NOT NULL,
  `viewer_name` varchar(100) NOT NULL,
  `viewer_role` varchar(100) DEFAULT '-',
  `first_viewed` datetime DEFAULT current_timestamp(),
  `last_viewed` datetime DEFAULT current_timestamp(),
  `total_duration` int(11) DEFAULT 0,
  `has_downloaded` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `memo_views`
--

INSERT INTO `memo_views` (`id`, `memo_id`, `viewer_name`, `viewer_role`, `first_viewed`, `last_viewed`, `total_duration`, `has_downloaded`) VALUES
(1, 11, 'Budget Head Zedryl', 'Department Head', '2026-02-06 06:34:57', '2026-02-06 06:34:57', 0, 0),
(2, 12, 'OCM Head', 'Department Head', '2026-02-07 00:22:24', '2026-02-07 00:22:26', 2, 0),
(3, 3, 'OCM Head', 'Department Head', '2026-02-07 00:22:27', '2026-02-07 00:22:27', 0, 0),
(4, 6, 'OCM Head', 'Department Head', '2026-02-07 00:22:29', '2026-02-07 00:22:33', 4, 0),
(5, 1, 'OCM Head', 'Department Head', '2026-02-07 00:29:49', '2026-02-07 00:29:49', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `feature_key` varchar(50) NOT NULL,
  `is_enabled` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_name`, `feature_key`, `is_enabled`) VALUES
(1, 'Super Administrator', 'manage_system', 1),
(2, 'Super Administrator', 'upload_document', 1),
(3, 'Super Administrator', 'sign_document', 1),
(4, 'Department Head', 'upload_document', 1),
(5, 'Department Head', 'upload_memo', 1),
(6, 'Department Head', 'sign_document', 1),
(7, 'Department Head', 'view_analytics', 1),
(8, 'Assistant Department Head', 'upload_document', 1),
(9, 'Assistant Department Head', 'upload_memo', 0),
(10, 'Assistant Department Head', 'sign_document', 1),
(11, 'Assistant Department Head', 'view_analytics', 1),
(12, 'CAS', 'upload_document', 1),
(13, 'CAS', 'upload_memo', 0),
(14, 'CAS', 'sign_document', 0),
(15, 'CAS', 'view_analytics', 0),
(20, 'Assistant Department Head', 'manage_system', 0),
(22, 'mwhehehe', 'manage_system', 0),
(23, 'mwhehehe', 'upload_document', 0),
(38, 'Super Administrator', 'view_analytics', 1),
(40, 'Department Head', 'manage_system', 0),
(61, 'Super Administrator', 'upload_memo', 1),
(72, 'Assistant Department Head', 'view_dashboard', 1),
(73, 'Assistant Department Head', 'view_tracking', 1),
(74, 'Assistant Department Head', 'view_records', 1),
(75, 'CAS', 'view_dashboard', 1),
(76, 'CAS', 'view_tracking', 1),
(77, 'CAS', 'view_records', 1),
(78, 'Department Head', 'view_dashboard', 1),
(79, 'Department Head', 'view_tracking', 1),
(80, 'Department Head', 'view_records', 1),
(81, 'Super Administrator', 'view_dashboard', 1),
(82, 'Super Administrator', 'view_tracking', 1),
(83, 'Super Administrator', 'view_records', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `role` varchar(50) NOT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `verification_token` varchar(255) DEFAULT NULL,
  `dept` varchar(50) NOT NULL,
  `signature_file` varchar(255) DEFAULT NULL,
  `otp_code` varchar(6) DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `account_type` varchar(20) DEFAULT 'local'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `google_id`, `role`, `is_verified`, `verification_token`, `dept`, `signature_file`, `otp_code`, `otp_expiry`, `account_type`) VALUES
(1, 'System Admin', 'admin@stotomas.gov.ph', 'admin', NULL, 'Super Administrator', 1, NULL, 'City Management Information Division (CMISD)', NULL, '950767', '2026-02-04 03:00:00', 'local'),
(2, 'BPLO Head', 'bplohead@stotomas.gov.ph', 'bplohead', NULL, 'Department Head', 1, NULL, 'Business Permit and Licensing Office (BPLO)', '../assets/uploads/signatures/sig_2_1770310477.png', NULL, NULL, 'local'),
(5, 'CBO Head', 'cbohead@stotomas.gov.ph', 'cbohead', NULL, 'Department Head', 1, NULL, 'City Budget Office (CBO)', '../assets/uploads/signatures/sig_5_1770331012.png', NULL, NULL, 'local'),
(8, 'CHRMO Head', 'chrmohead@stotomas.gov.ph', 'chrmohead', NULL, 'Department Head', 1, NULL, 'City Human Resource Management Office (CHRMO)', '../assets/uploads/signatures/sig_8_1770104595.png', NULL, NULL, 'local'),
(11, 'CIO Head', 'ciohead@stotomas.gov.ph', 'ciohead', NULL, 'Department Head', 1, NULL, 'City Information Office (CIO)', NULL, NULL, NULL, 'local'),
(14, 'CLO Head', 'clohead@stotomas.gov.ph', 'clohead', NULL, 'Department Head', 1, NULL, 'City Legal Office (CLO)', NULL, NULL, NULL, 'local'),
(17, 'CMISD Head', 'cmisdhead@stotomas.gov.ph', 'cmisdhead', NULL, 'Department Head', 1, NULL, 'City Management Information Division (CMISD)', '../assets/uploads/signatures/sig_17_1770314327.png', NULL, NULL, 'local'),
(20, 'CPO Head', 'cpohead@stotomas.gov.ph', 'cpohead', NULL, 'Department Head', 1, NULL, 'City Procurement Office (CPO)', NULL, NULL, NULL, 'local'),
(23, 'CPMO Head', 'cpmohead@stotomas.gov.ph', 'cpmohead', NULL, 'Department Head', 1, NULL, 'City Public Market Office (CPMO)', NULL, NULL, NULL, 'local'),
(26, 'CTO Head', 'ctohead@stotomas.gov.ph', 'ctohead', NULL, 'Department Head', 1, NULL, 'City Treasury Office (CTO)', '../assets/uploads/signatures/sig_26_1770331051.png', NULL, NULL, 'local'),
(29, 'OCM Head', 'ocmhead@stotomas.gov.ph', 'ocmhead', NULL, 'Department Head', 1, NULL, 'Office of the City Mayor (OCM)', '../assets/uploads/signatures/sig_29_1770330956.png', NULL, NULL, 'local'),
(49, 'Local Budget Head Zedrl', 'zedshey28@budgethead', 'zedshey28', NULL, 'Department Head', 1, NULL, 'City Budget Office (CBO)', NULL, NULL, NULL, 'local'),
(51, 'BPLO Zedryl', 'bplozedryl@bplo', 'bplozedryl', NULL, 'Department Head', 1, NULL, 'Business Permit and Licensing Office (BPLO)', NULL, NULL, NULL, 'local'),
(52, 'Mayor Lashawn', 'lashawndiazz@gmail.com', 'lashawn123', NULL, 'Department Head', 1, NULL, 'Office of the City Mayor (OCM)', '../assets/uploads/signatures/sig_52_1770327679.jpg', NULL, NULL, 'google'),
(53, 'Budget Head Zedryl', 'zedshey28@gmail.com', 'zedshey28', '104501289260485855530', 'Department Head', 1, NULL, 'City Budget Office (CBO)', '../assets/uploads/signatures/sig_53_1770227417.png', NULL, NULL, 'google'),
(54, 'CAO Head', 'caohead@stotomas.gov.ph', 'caohead', NULL, 'Department Head', 1, NULL, 'City Administrator Office (CAO)', '../assets/uploads/signatures/sig_54_1770314408.png', NULL, NULL, 'local'),
(55, 'CAO Head 2', 'caohead2@stotomas.gov.ph', 'caohead2', NULL, 'Department Head', 1, NULL, 'City Administrator Office (CAO)', NULL, NULL, NULL, 'local'),
(56, 'CAO Head 3', 'caohead3@stotomas.gov.ph', 'caohead3', NULL, 'Department Head', 1, NULL, 'City Administrator Office (CAO)', '../assets/uploads/signatures/sig_56_1770225797.jpg', NULL, NULL, 'local'),
(58, 'CTO Merwin Head', 'generosomerwin10@gmail.com', 'generosomm', NULL, 'Department Head', 1, NULL, 'City Treasury Office (CTO)', '../assets/uploads/signatures/sig_58_1770328395.png', NULL, NULL, 'google'),
(59, 'BPLO Staff 1', 'bplo_staff@stotomas.gov.ph', 'staff123', NULL, 'CAS', 1, NULL, 'Business Permit and Licensing Office (BPLO)', NULL, NULL, NULL, 'local'),
(60, 'Budget Officer I', 'cbo_staff@stotomas.gov.ph', 'staff123', NULL, 'CAS', 1, NULL, 'City Budget Office (CBO)', NULL, NULL, NULL, 'local'),
(61, 'Treasury Clerk', 'cto_staff@stotomas.gov.ph', 'staff123', NULL, 'CAS', 1, NULL, 'City Treasury Office (CTO)', NULL, NULL, NULL, 'local'),
(62, 'Records Officer', 'ocm_records@stotomas.gov.ph', 'staff123', NULL, 'CAS', 1, NULL, 'Office of the City Mayor (OCM)', NULL, NULL, NULL, 'local');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`id`, `role_name`, `description`) VALUES
(1, 'Super Administrator', NULL),
(2, 'Department Head', NULL),
(3, 'Assistant Department Head', NULL),
(4, 'CAS', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`doc_id`);

--
-- Indexes for table `doc_timeline`
--
ALTER TABLE `doc_timeline`
  ADD PRIMARY KEY (`id`),
  ADD KEY `doc_id` (`doc_id`);

--
-- Indexes for table `fixed_routes`
--
ALTER TABLE `fixed_routes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `category` (`category`);

--
-- Indexes for table `memos`
--
ALTER TABLE `memos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `memo_views`
--
ALTER TABLE `memo_views`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_view` (`memo_id`,`viewer_name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_perm` (`role_name`,`feature_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `doc_timeline`
--
ALTER TABLE `doc_timeline`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=302;

--
-- AUTO_INCREMENT for table `fixed_routes`
--
ALTER TABLE `fixed_routes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `memos`
--
ALTER TABLE `memos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `memo_views`
--
ALTER TABLE `memo_views`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `doc_timeline`
--
ALTER TABLE `doc_timeline`
  ADD CONSTRAINT `doc_timeline_ibfk_1` FOREIGN KEY (`doc_id`) REFERENCES `documents` (`doc_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
