--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: pose_keypoints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pose_keypoints (
    id integer NOT NULL,
    image_id character varying(255) NOT NULL,
    keypoints_json jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pose_keypoints OWNER TO postgres;

--
-- Name: pose_keypoints_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pose_keypoints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pose_keypoints_id_seq OWNER TO postgres;

--
-- Name: pose_keypoints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pose_keypoints_id_seq OWNED BY public.pose_keypoints.id;


--
-- Name: pose_keypoints id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pose_keypoints ALTER COLUMN id SET DEFAULT nextval('public.pose_keypoints_id_seq'::regclass);


--
-- Data for Name: pose_keypoints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pose_keypoints (id, image_id, keypoints_json, created_at) FROM stdin;
\.


--
-- Name: pose_keypoints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pose_keypoints_id_seq', 1, false);


--
-- Name: pose_keypoints pose_keypoints_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pose_keypoints
    ADD CONSTRAINT pose_keypoints_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

