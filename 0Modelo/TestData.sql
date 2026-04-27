SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict Lrd31iSW2t9LNsiKnF49IyLHMhhzGhAlRhoqLXAoEGTPbNW0MqgfiGPKOSEiYJl

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") VALUES
	('40c23f72-6251-4158-bc2b-91e12a40056e', '261cf85f-cc14-48a9-87de-f27126712265', '89c30ea6-3091-4b1c-81a6-8f0a6eb2bc52', 's256', 'gwnlpl0s2ugLSAajIwY7ACEck3Yg-LHjljhPkHE6Mwo', 'email', '', '', '2026-04-15 15:43:24.325202+00', '2026-04-15 15:43:24.325202+00', 'email/signup', NULL, NULL, NULL, NULL, NULL, false);


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'd7b0f50a-d507-4eb6-b9e2-c9c840b745bf', 'authenticated', 'authenticated', 'prueba@gmail.com', '$2a$10$IsqqUqHIxq6YVU3aJ9UEquz1XsQ1r8QSHQc8DgKacwbz7bCrQ2uGq', '2026-04-21 10:52:59.438562+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-21 13:12:07.586513+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "d7b0f50a-d507-4eb6-b9e2-c9c840b745bf", "email": "prueba@gmail.com", "email_verified": true, "nombrecompleto": "prueba", "phone_verified": false}', NULL, '2026-04-21 10:52:59.401559+00', '2026-04-21 13:12:07.603149+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a1e8a323-c195-43d1-9711-1de3a65adcad', 'authenticated', 'authenticated', 'eje@gmail.com', '$2a$10$PwiH5LNuqLT3WIfDRztRuu/UMHmMlv0FWPctetdcN9ST6RjM9U7lK', '2026-04-21 17:36:11.008039+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-24 10:11:39.304078+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "a1e8a323-c195-43d1-9711-1de3a65adcad", "email": "eje@gmail.com", "email_verified": true, "nombrecompleto": "Ejemplo Usu", "phone_verified": false}', NULL, '2026-04-21 17:36:10.973653+00', '2026-04-24 10:11:39.318844+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ed63d59a-9284-4a89-89a8-a1fa757ac9a1', 'authenticated', 'authenticated', 'josefcodiaz@hotmail.com', '$2a$10$fwlplDgJhhnLv6O9DagdT.wBTfvmJI8vQOTn.b2cew6tDz.FUmq6y', '2026-04-24 15:43:58.342452+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-24 15:43:58.355302+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "ed63d59a-9284-4a89-89a8-a1fa757ac9a1", "email": "josefcodiaz@hotmail.com", "email_verified": true, "nombrecompleto": "Jose Diaz", "phone_verified": false}', NULL, '2026-04-24 15:43:58.294564+00', '2026-04-25 00:01:45.348473+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'e31a92e9-5c18-4dac-8cd6-0f6dd94133b9', 'authenticated', 'authenticated', 'enrique@gmail.com', '$2a$10$KBwY91E0.kmvISL/psGMzOdgRofH6H/iCa2vZCv41dyFoE/PbERPi', '2026-04-21 13:54:49.076137+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-21 14:02:04.730218+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "e31a92e9-5c18-4dac-8cd6-0f6dd94133b9", "email": "enrique@gmail.com", "email_verified": true, "nombrecompleto": "Enrique", "phone_verified": false}', NULL, '2026-04-21 13:54:49.053006+00', '2026-04-25 11:33:50.508685+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '48584202-4666-469f-a64d-a9b49df4b61d', 'authenticated', 'authenticated', 'perro@gmail.com', '$2a$10$YCXB8pW7Y453Qbvqn43y8uNRydD4HO.prLdzW7iVjIkf//Ol/Y8bK', '2026-04-21 13:13:06.58202+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-21 13:13:06.589003+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "48584202-4666-469f-a64d-a9b49df4b61d", "email": "perro@gmail.com", "email_verified": true, "nombrecompleto": "perro", "phone_verified": false}', NULL, '2026-04-21 13:13:06.537385+00', '2026-04-21 13:13:06.594401+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'fa7b1d06-b8e2-4345-aa8e-626ebf593c0e', 'authenticated', 'authenticated', 'asfa@g', '$2a$10$FIg0cpocuAtTcLp4h9W3R.B8hnDSzpDH1qnqsL7MRnfMLWfOIXppS', '2026-04-21 13:24:46.552704+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-21 13:24:46.557074+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "fa7b1d06-b8e2-4345-aa8e-626ebf593c0e", "email": "asfa@g", "email_verified": true, "nombrecompleto": "asf", "phone_verified": false}', NULL, '2026-04-21 13:24:46.534963+00', '2026-04-21 13:24:46.56043+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3ec3a596-26d0-41cf-b005-aabdccc78cdc', 'authenticated', 'authenticated', 'iker@molina.com', '$2a$10$uFb1EaUdwjgdoKwi.tC0hurpKKA1DK3M.x9GOrKVKSj9qXdB1oIRO', '2026-04-21 13:22:19.180597+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-21 13:53:51.353496+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "3ec3a596-26d0-41cf-b005-aabdccc78cdc", "email": "iker@molina.com", "email_verified": true, "nombrecompleto": "Iker Molina", "phone_verified": false}', NULL, '2026-04-21 13:22:19.15429+00', '2026-04-21 13:53:51.367155+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '0f1c745a-ff81-499d-af9c-96abd3ac8c0e', 'authenticated', 'authenticated', 'fds@hola.com', '$2a$10$bZMYQ5E3P5oBycKRD4PTDuP.ZlA4Khh4hDH2ewdIAcNQEx/2Xn4g2', '2026-04-21 13:26:56.023859+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-21 13:26:56.030188+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "0f1c745a-ff81-499d-af9c-96abd3ac8c0e", "email": "fds@hola.com", "email_verified": true, "nombrecompleto": "buenas", "phone_verified": false}', NULL, '2026-04-21 13:26:55.99811+00', '2026-04-21 13:26:56.035217+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '65b9a858-1413-4290-8bdc-35ce1b910ba3', 'authenticated', 'authenticated', 'asd@a', '$2a$10$rvoZIFxH9yk0F4GtAGXNneGDxHHK48CIL.M7XWgugI2bl9HSEbCvu', '2026-04-21 13:38:00.750259+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-21 13:38:00.755748+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "65b9a858-1413-4290-8bdc-35ce1b910ba3", "email": "asd@a", "email_verified": true, "nombrecompleto": "asfas", "phone_verified": false}', NULL, '2026-04-21 13:38:00.729626+00', '2026-04-21 17:35:46.226948+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('d7b0f50a-d507-4eb6-b9e2-c9c840b745bf', 'd7b0f50a-d507-4eb6-b9e2-c9c840b745bf', '{"sub": "d7b0f50a-d507-4eb6-b9e2-c9c840b745bf", "email": "prueba@gmail.com", "email_verified": false, "nombrecompleto": "prueba", "phone_verified": false}', 'email', '2026-04-21 10:52:59.432483+00', '2026-04-21 10:52:59.432535+00', '2026-04-21 10:52:59.432535+00', 'b086ec71-e79a-4dea-9fd4-c36e75de133e'),
	('48584202-4666-469f-a64d-a9b49df4b61d', '48584202-4666-469f-a64d-a9b49df4b61d', '{"sub": "48584202-4666-469f-a64d-a9b49df4b61d", "email": "perro@gmail.com", "email_verified": false, "nombrecompleto": "perro", "phone_verified": false}', 'email', '2026-04-21 13:13:06.578369+00', '2026-04-21 13:13:06.578423+00', '2026-04-21 13:13:06.578423+00', 'ddd0681a-2dca-4fca-b7d4-a6da1d9e566a'),
	('3ec3a596-26d0-41cf-b005-aabdccc78cdc', '3ec3a596-26d0-41cf-b005-aabdccc78cdc', '{"sub": "3ec3a596-26d0-41cf-b005-aabdccc78cdc", "email": "iker@molina.com", "email_verified": false, "nombrecompleto": "Iker Molina", "phone_verified": false}', 'email', '2026-04-21 13:22:19.176565+00', '2026-04-21 13:22:19.176626+00', '2026-04-21 13:22:19.176626+00', '28de82df-4f67-480c-a198-fa223fe10600'),
	('fa7b1d06-b8e2-4345-aa8e-626ebf593c0e', 'fa7b1d06-b8e2-4345-aa8e-626ebf593c0e', '{"sub": "fa7b1d06-b8e2-4345-aa8e-626ebf593c0e", "email": "asfa@g", "email_verified": false, "nombrecompleto": "asf", "phone_verified": false}', 'email', '2026-04-21 13:24:46.54961+00', '2026-04-21 13:24:46.54966+00', '2026-04-21 13:24:46.54966+00', 'a6a2e12b-759d-440b-aa95-284ed6954ac2'),
	('0f1c745a-ff81-499d-af9c-96abd3ac8c0e', '0f1c745a-ff81-499d-af9c-96abd3ac8c0e', '{"sub": "0f1c745a-ff81-499d-af9c-96abd3ac8c0e", "email": "fds@hola.com", "email_verified": false, "nombrecompleto": "buenas", "phone_verified": false}', 'email', '2026-04-21 13:26:56.020141+00', '2026-04-21 13:26:56.020201+00', '2026-04-21 13:26:56.020201+00', 'd6330fd9-f41b-41fa-8711-82f140d46a21'),
	('65b9a858-1413-4290-8bdc-35ce1b910ba3', '65b9a858-1413-4290-8bdc-35ce1b910ba3', '{"sub": "65b9a858-1413-4290-8bdc-35ce1b910ba3", "email": "asd@a", "email_verified": false, "nombrecompleto": "asfas", "phone_verified": false}', 'email', '2026-04-21 13:38:00.746407+00', '2026-04-21 13:38:00.746457+00', '2026-04-21 13:38:00.746457+00', 'e951f516-1d93-49de-8389-3485c6502237'),
	('e31a92e9-5c18-4dac-8cd6-0f6dd94133b9', 'e31a92e9-5c18-4dac-8cd6-0f6dd94133b9', '{"sub": "e31a92e9-5c18-4dac-8cd6-0f6dd94133b9", "email": "enrique@gmail.com", "email_verified": false, "nombrecompleto": "Enrique", "phone_verified": false}', 'email', '2026-04-21 13:54:49.072071+00', '2026-04-21 13:54:49.072127+00', '2026-04-21 13:54:49.072127+00', '393f182a-5406-4250-a9b7-4a3f57072947'),
	('a1e8a323-c195-43d1-9711-1de3a65adcad', 'a1e8a323-c195-43d1-9711-1de3a65adcad', '{"sub": "a1e8a323-c195-43d1-9711-1de3a65adcad", "email": "eje@gmail.com", "email_verified": false, "nombrecompleto": "Ejemplo Usu", "phone_verified": false}', 'email', '2026-04-21 17:36:11.005059+00', '2026-04-21 17:36:11.005108+00', '2026-04-21 17:36:11.005108+00', 'ceb773cb-9e06-4215-9bb4-9a08f86aa991'),
	('ed63d59a-9284-4a89-89a8-a1fa757ac9a1', 'ed63d59a-9284-4a89-89a8-a1fa757ac9a1', '{"sub": "ed63d59a-9284-4a89-89a8-a1fa757ac9a1", "email": "josefcodiaz@hotmail.com", "email_verified": false, "nombrecompleto": "Jose Diaz", "phone_verified": false}', 'email', '2026-04-24 15:43:58.335942+00', '2026-04-24 15:43:58.33599+00', '2026-04-24 15:43:58.33599+00', '195ea350-65dc-40ff-84cd-1b3ace30d1c8');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('a1d1cbad-e0d4-44be-b0c2-ad950af44b51', 'a1e8a323-c195-43d1-9711-1de3a65adcad', '2026-04-24 10:11:39.305102+00', '2026-04-24 10:11:39.305102+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '87.117.98.161', NULL, NULL, NULL, NULL, NULL),
	('0f927df8-053c-4481-af9c-854615e19bf3', '48584202-4666-469f-a64d-a9b49df4b61d', '2026-04-21 13:13:06.590142+00', '2026-04-21 13:13:06.590142+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '45.149.228.6', NULL, NULL, NULL, NULL, NULL),
	('7e49f5ee-97ea-49a2-bf4e-2586f421d144', 'fa7b1d06-b8e2-4345-aa8e-626ebf593c0e', '2026-04-21 13:24:46.558142+00', '2026-04-21 13:24:46.558142+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '37.152.95.220', NULL, NULL, NULL, NULL, NULL),
	('698dd2e7-9fec-4de6-bddb-003f9bf26718', 'ed63d59a-9284-4a89-89a8-a1fa757ac9a1', '2026-04-24 15:43:58.355415+00', '2026-04-25 00:01:45.358554+00', NULL, 'aal1', NULL, '2026-04-25 00:01:45.358433', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0', '88.20.155.246', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('0f927df8-053c-4481-af9c-854615e19bf3', '2026-04-21 13:13:06.594814+00', '2026-04-21 13:13:06.594814+00', 'password', '61f51092-6d99-472e-866f-b373a1ad9588'),
	('7e49f5ee-97ea-49a2-bf4e-2586f421d144', '2026-04-21 13:24:46.560966+00', '2026-04-21 13:24:46.560966+00', 'password', '035d6c13-f76c-44eb-a663-f53815a9ca52'),
	('a1d1cbad-e0d4-44be-b0c2-ad950af44b51', '2026-04-24 10:11:39.330817+00', '2026-04-24 10:11:39.330817+00', 'password', '9aa35450-eb0b-48b2-9c06-31d374dd8a70'),
	('698dd2e7-9fec-4de6-bddb-003f9bf26718', '2026-04-24 15:43:58.384108+00', '2026-04-24 15:43:58.384108+00', 'password', 'f16f93a3-001d-44df-9e41-6fae0693ec03');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 8, '3rcovmiek34m', '48584202-4666-469f-a64d-a9b49df4b61d', false, '2026-04-21 13:13:06.593311+00', '2026-04-21 13:13:06.593311+00', NULL, '0f927df8-053c-4481-af9c-854615e19bf3'),
	('00000000-0000-0000-0000-000000000000', 10, 'n5kwr3wvfbkc', 'fa7b1d06-b8e2-4345-aa8e-626ebf593c0e', false, '2026-04-21 13:24:46.559325+00', '2026-04-21 13:24:46.559325+00', NULL, '7e49f5ee-97ea-49a2-bf4e-2586f421d144'),
	('00000000-0000-0000-0000-000000000000', 34, 'aog6e5767ic3', 'a1e8a323-c195-43d1-9711-1de3a65adcad', false, '2026-04-24 10:11:39.316493+00', '2026-04-24 10:11:39.316493+00', NULL, 'a1d1cbad-e0d4-44be-b0c2-ad950af44b51'),
	('00000000-0000-0000-0000-000000000000', 35, 'leqehpowmvlw', 'ed63d59a-9284-4a89-89a8-a1fa757ac9a1', true, '2026-04-24 15:43:58.369513+00', '2026-04-24 16:44:31.427235+00', NULL, '698dd2e7-9fec-4de6-bddb-003f9bf26718'),
	('00000000-0000-0000-0000-000000000000', 36, 'iu7dgmyfxvik', 'ed63d59a-9284-4a89-89a8-a1fa757ac9a1', true, '2026-04-24 16:44:31.440768+00', '2026-04-24 17:43:33.184058+00', 'leqehpowmvlw', '698dd2e7-9fec-4de6-bddb-003f9bf26718'),
	('00000000-0000-0000-0000-000000000000', 37, '4jtvzr63mhfk', 'ed63d59a-9284-4a89-89a8-a1fa757ac9a1', true, '2026-04-24 17:43:33.19419+00', '2026-04-24 18:42:15.299097+00', 'iu7dgmyfxvik', '698dd2e7-9fec-4de6-bddb-003f9bf26718'),
	('00000000-0000-0000-0000-000000000000', 38, 'mbxycl4hves2', 'ed63d59a-9284-4a89-89a8-a1fa757ac9a1', true, '2026-04-24 18:42:15.311415+00', '2026-04-24 21:59:48.479862+00', '4jtvzr63mhfk', '698dd2e7-9fec-4de6-bddb-003f9bf26718'),
	('00000000-0000-0000-0000-000000000000', 39, 'zadsvscjlxnk', 'ed63d59a-9284-4a89-89a8-a1fa757ac9a1', true, '2026-04-24 21:59:48.492609+00', '2026-04-24 22:58:40.055533+00', 'mbxycl4hves2', '698dd2e7-9fec-4de6-bddb-003f9bf26718'),
	('00000000-0000-0000-0000-000000000000', 40, 'cwvfodutorjs', 'ed63d59a-9284-4a89-89a8-a1fa757ac9a1', true, '2026-04-24 22:58:40.064814+00', '2026-04-25 00:01:45.337486+00', 'zadsvscjlxnk', '698dd2e7-9fec-4de6-bddb-003f9bf26718'),
	('00000000-0000-0000-0000-000000000000', 41, 'vtjjnimxism2', 'ed63d59a-9284-4a89-89a8-a1fa757ac9a1', false, '2026-04-25 00:01:45.34436+00', '2026-04-25 00:01:45.34436+00', 'cwvfodutorjs', '698dd2e7-9fec-4de6-bddb-003f9bf26718');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: divisas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."divisas" ("codigo", "descripcion", "simbolo_divisa") VALUES
	('EUR', 'Euro', '€'),
	('USD', 'Dólar estadounidense', '$'),
	('GBP', 'Libra esterlina', '£');


--
-- Data for Name: perfiles_riesgo; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."perfiles_riesgo" ("codigo", "descripcion") VALUES
	('BAJO', 'Riesgo bajo'),
	('MEDIO', 'Riesgo medio'),
	('ALTO', 'Riesgo alto');


--
-- Data for Name: tiposactivos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tiposactivos" ("codigo", "descripcion", "logo", "riesgocodigo") VALUES
	('CRYPTO', 'Criptomonedas', NULL, 'ALTO'),
	('INVERSION', 'Inversiones tradicionales', NULL, 'MEDIO'),
	('PROPIEDAD', 'Propiedades inmobiliarias', NULL, 'BAJO');


--
-- Data for Name: activos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."activos" ("codigo", "descripcion", "tipocodigo", "divisacodigo", "color", "simbolo") VALUES
	(20, 'Fondo Indexado Global', 'INVERSION', 'EUR', '#10b981', NULL),
	(30, 'Vivienda en Madrid', 'PROPIEDAD', 'EUR', '#8b5cf6', NULL),
	(31, 'Local en Londres', 'PROPIEDAD', 'GBP', '#f59e0b', NULL),
	(10, 'Bitcoin', 'CRYPTO', 'USD', '#F7931A', 'BTC'),
	(11, 'Ethereum', 'CRYPTO', 'USD', '#627EEA', 'ETH'),
	(21, 'ETF S&P 500', 'INVERSION', 'USD', '#1f77b4', 'SPY');


--
-- Data for Name: idiomas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."idiomas" ("codigo", "descripcion") VALUES
	('ES', 'Español'),
	('EN', 'Inglés'),
	('FR', 'Francés');


--
-- Data for Name: perfiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."perfiles" ("id", "nombrecompleto", "telefono", "perfilriesgocodigo", "divisabasecodigo", "idiomacodigo", "formatofecha", "ultimoacceso", "created_at") VALUES
	('d7b0f50a-d507-4eb6-b9e2-c9c840b745bf', 'prueba', NULL, NULL, NULL, NULL, 'DD/MM/YYYY', '2026-04-21 10:52:59.400707+00', '2026-04-21 10:52:59.400707+00'),
	('48584202-4666-469f-a64d-a9b49df4b61d', 'perro', NULL, NULL, NULL, NULL, 'DD/MM/YYYY', '2026-04-21 13:13:06.535764+00', '2026-04-21 13:13:06.535764+00'),
	('3ec3a596-26d0-41cf-b005-aabdccc78cdc', 'Iker Molina', NULL, NULL, NULL, NULL, 'DD/MM/YYYY', '2026-04-21 13:22:19.15339+00', '2026-04-21 13:22:19.15339+00'),
	('fa7b1d06-b8e2-4345-aa8e-626ebf593c0e', 'asf', NULL, NULL, NULL, NULL, 'DD/MM/YYYY', '2026-04-21 13:24:46.534649+00', '2026-04-21 13:24:46.534649+00'),
	('0f1c745a-ff81-499d-af9c-96abd3ac8c0e', 'buenas', NULL, NULL, NULL, NULL, 'DD/MM/YYYY', '2026-04-21 13:26:55.994951+00', '2026-04-21 13:26:55.994951+00'),
	('65b9a858-1413-4290-8bdc-35ce1b910ba3', 'asfas', NULL, NULL, NULL, NULL, 'DD/MM/YYYY', '2026-04-21 13:38:00.728698+00', '2026-04-21 13:38:00.728698+00'),
	('e31a92e9-5c18-4dac-8cd6-0f6dd94133b9', 'Enrique', NULL, NULL, NULL, NULL, 'DD/MM/YYYY', '2026-04-21 13:54:49.052699+00', '2026-04-21 13:54:49.052699+00'),
	('a1e8a323-c195-43d1-9711-1de3a65adcad', 'Tomás', NULL, 'ALTO', 'USD', NULL, 'DD/MM/YYYY', '2026-04-21 17:40:24.587+00', '2026-04-21 17:36:10.97333+00'),
	('ed63d59a-9284-4a89-89a8-a1fa757ac9a1', 'Jose Diaz', NULL, NULL, 'EUR', NULL, 'DD/MM/YYYY', '2026-04-24 16:01:53.984+00', '2026-04-24 15:43:58.291976+00');


--
-- Data for Name: activosposeidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."activosposeidos" ("activocodigo", "cantidad", "fechainicio", "usuario_id", "precio_compra", "idrelacion") VALUES
	(10, 0.5, '2026-04-01', NULL, 0, 1),
	(20, 100, '2026-04-01', NULL, 0, 2),
	(11, 2, '2026-04-01', NULL, 0, 3),
	(21, 50, '2026-04-01', NULL, 0, 4),
	(30, 1, '2026-04-01', NULL, 0, 5),
	(20, 200, '2026-04-01', NULL, 0, 6),
	(31, 1, '2026-04-01', NULL, 0, 7),
	(10, 5, '2026-04-01', NULL, 0, 8),
	(11, 10, '2026-04-01', NULL, 0, 9),
	(10, 3, NULL, 'e31a92e9-5c18-4dac-8cd6-0f6dd94133b9', 0, 10),
	(10, 1, NULL, 'e31a92e9-5c18-4dac-8cd6-0f6dd94133b9', 0, 11),
	(11, 3, '2026-04-29', 'a1e8a323-c195-43d1-9711-1de3a65adcad', 0, 12),
	(30, 1, '2026-04-22', 'a1e8a323-c195-43d1-9711-1de3a65adcad', 300000, 13),
	(20, 300, '2026-04-23', 'a1e8a323-c195-43d1-9711-1de3a65adcad', 15, 14),
	(10, 1, '2026-04-10', 'ed63d59a-9284-4a89-89a8-a1fa757ac9a1', 0, -1),
	(20, 1, '2026-04-01', 'ed63d59a-9284-4a89-89a8-a1fa757ac9a1', 0, -2),
	(10, 2, '2026-04-20', 'ed63d59a-9284-4a89-89a8-a1fa757ac9a1', 0, -3);


--
-- Data for Name: cambios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."cambios" ("divisaorigen", "divisadestino", "fecini", "fecfin", "cambio") VALUES
	('EUR', 'USD', '2026-04-11', '2026-04-11', 1.10),
	('USD', 'EUR', '2026-04-11', '2026-04-11', 0.91),
	('EUR', 'GBP', '2026-04-11', '2026-04-11', 0.85),
	('EUR', 'USD', '2026-04-10', '2026-04-10', 1.11),
	('USD', 'EUR', '2026-04-10', '2026-04-10', 0.92),
	('EUR', 'GBP', '2026-04-10', '2026-04-10', 0.86),
	('EUR', 'USD', '2026-04-09', '2026-04-09', 1.12),
	('USD', 'EUR', '2026-04-09', '2026-04-09', 0.93),
	('EUR', 'GBP', '2026-04-09', '2026-04-09', 0.87),
	('EUR', 'USD', '2026-04-08', '2026-04-08', 1.13),
	('USD', 'EUR', '2026-04-08', '2026-04-08', 0.94),
	('EUR', 'GBP', '2026-04-08', '2026-04-08', 0.88),
	('EUR', 'USD', '2026-04-07', '2026-04-07', 1.14),
	('USD', 'EUR', '2026-04-07', '2026-04-07', 0.95),
	('EUR', 'GBP', '2026-04-07', '2026-04-07', 0.89),
	('EUR', 'USD', '2026-04-06', '2026-04-06', 1.15),
	('USD', 'EUR', '2026-04-06', '2026-04-06', 0.96),
	('EUR', 'GBP', '2026-04-06', '2026-04-06', 0.90),
	('EUR', 'USD', '2026-04-05', '2026-04-05', 1.16),
	('USD', 'EUR', '2026-04-05', '2026-04-05', 0.97),
	('EUR', 'GBP', '2026-04-05', '2026-04-05', 0.91),
	('EUR', 'USD', '2026-04-12', NULL, 1.1),
	('USD', 'EUR', '2026-04-12', NULL, 0.9);


--
-- Data for Name: tiposcuentas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tiposcuentas" ("codigo", "descripcion") VALUES
	('CORRIENTE', 'Cuenta corriente'),
	('AHORRO', 'Cuenta de ahorro'),
	('INVERSIÓN', 'Cuenta de inversión'),
	('BINANCE', 'Exchange Binance'),
	('COINBASE', 'Exchange Coinbase'),
	('IBKR', 'Interactive Brokers');


--
-- Data for Name: cuentas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."cuentas" ("tipocuentacodigo", "numerocuenta", "fechaenlace", "activa", "usuario_id", "apikey_cifrada") VALUES
	('CORRIENTE', 1, '2026-04-11', true, NULL, NULL),
	('AHORRO', 2, '2026-04-11', true, NULL, NULL),
	('INVERSIÓN', 1, '2026-04-11', true, NULL, NULL);


--
-- Data for Name: valorhistoricoactivo; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."valorhistoricoactivo" ("activocodigo", "fecha", "valor") VALUES
	(10, '2026-04-05', 30000),
	(10, '2026-04-06', 30500),
	(10, '2026-04-07', 31000),
	(10, '2026-04-08', 29500),
	(10, '2026-04-09', 32000),
	(10, '2026-04-10', 33000),
	(10, '2026-04-11', 32500),
	(11, '2026-04-05', 2000),
	(11, '2026-04-06', 2100),
	(11, '2026-04-07', 2050),
	(11, '2026-04-08', 2200),
	(11, '2026-04-09', 2300),
	(11, '2026-04-10', 2400),
	(11, '2026-04-11', 2350),
	(20, '2026-04-05', 100),
	(20, '2026-04-06', 102),
	(20, '2026-04-07', 101),
	(20, '2026-04-08', 103),
	(20, '2026-04-09', 104),
	(20, '2026-04-10', 105),
	(20, '2026-04-11', 106),
	(21, '2026-04-05', 50),
	(21, '2026-04-06', 51),
	(21, '2026-04-07', 52),
	(21, '2026-04-08', 53),
	(21, '2026-04-09', 52),
	(21, '2026-04-10', 54),
	(21, '2026-04-11', 55),
	(30, '2026-04-05', 200000),
	(30, '2026-04-06', 200500),
	(30, '2026-04-07', 201000),
	(30, '2026-04-08', 202000),
	(30, '2026-04-09', 202500),
	(30, '2026-04-10', 203000),
	(30, '2026-04-11', 203500),
	(31, '2026-04-05', 150000),
	(31, '2026-04-06', 150200),
	(31, '2026-04-07', 150500),
	(31, '2026-04-08', 151000),
	(31, '2026-04-09', 151200),
	(31, '2026-04-10', 151500),
	(31, '2026-04-11', 152000),
	(10, '2026-04-12', 29500),
	(10, '2026-04-13', 32000),
	(10, '2026-04-14', 33000),
	(10, '2026-04-15', 32500),
	(11, '2026-04-12', 2200),
	(11, '2026-04-13', 2300),
	(11, '2026-04-14', 2400),
	(11, '2026-04-15', 2350),
	(20, '2026-04-12', 103),
	(20, '2026-04-13', 104),
	(20, '2026-04-14', 105),
	(20, '2026-04-15', 106),
	(21, '2026-04-12', 53),
	(21, '2026-04-13', 52),
	(21, '2026-04-14', 54),
	(21, '2026-04-15', 55),
	(30, '2026-04-12', 202000),
	(30, '2026-04-13', 202500),
	(30, '2026-04-14', 203000),
	(30, '2026-04-15', 203500),
	(31, '2026-04-12', 151000),
	(31, '2026-04-13', 151200),
	(31, '2026-04-14', 151500),
	(31, '2026-04-15', 152000),
	(10, '2026-04-21', 76794),
	(11, '2026-04-21', 2334.47);


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 42, true);


--
-- Name: activosposeidos_idRelacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."activosposeidos_idRelacion_seq"', 15, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict Lrd31iSW2t9LNsiKnF49IyLHMhhzGhAlRhoqLXAoEGTPbNW0MqgfiGPKOSEiYJl

RESET ALL;
