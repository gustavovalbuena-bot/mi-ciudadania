import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ArrowLeft, ArrowRight, Award, BookOpen, Check, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, CircleDot, ClipboardList, DollarSign, Eye, FileText, Flag, Info, Layers, Menu, MessageSquare, RotateCcw, Scale, Search, Shield, Shuffle, Star, Target, X } from "lucide-react";

// MI_CIUDADANIA_VERSION = "2.0.1"

// ─── DATA ────────────────────────────────────────────────────────────────────

const CIVICS_QUESTIONS = [
  // AMERICAN GOVERNMENT - A: Principles of American Government
  { id: 1, section: "Gobierno Americano", subsection: "Principios", q_en: "What is the form of government of the United States?", q_es: "¿Cuál es la forma de gobierno de los Estados Unidos?", answers_en: ["Republic", "Constitution-based federal republic", "Representative democracy"], answers_es: ["República", "República federal basada en la Constitución", "Democracia representativa"], starred: false },
  { id: 2, section: "Gobierno Americano", subsection: "Principios", q_en: "What is the supreme law of the land?", q_es: "¿Cuál es la ley suprema del país?", answers_en: ["(U.S.) Constitution"], answers_es: ["La Constitución (de EE.UU.)"], starred: true },
  { id: 3, section: "Gobierno Americano", subsection: "Principios", q_en: "Name one thing the U.S. Constitution does.", q_es: "Nombre una cosa que hace la Constitución de EE.UU.", answers_en: ["Forms the government", "Defines powers of government", "Defines the parts of government", "Protects the rights of the people"], answers_es: ["Forma el gobierno", "Define los poderes del gobierno", "Define las partes del gobierno", "Protege los derechos del pueblo"], starred: false },
  { id: 4, section: "Gobierno Americano", subsection: "Principios", q_en: "The U.S. Constitution starts with the words 'We the People.' What does 'We the People' mean?", q_es: "La Constitución de EE.UU. comienza con las palabras 'We the People' (Nosotros el Pueblo). ¿Qué significa?", answers_en: ["Self-government", "Popular sovereignty", "Consent of the governed", "People should govern themselves", "(Example of) social contract"], answers_es: ["Autogobierno", "Soberanía popular", "Consentimiento de los gobernados", "El pueblo debe gobernarse a sí mismo", "(Ejemplo de) contrato social"], starred: false },
  { id: 5, section: "Gobierno Americano", subsection: "Principios", q_en: "How are changes made to the U.S. Constitution?", q_es: "¿Cómo se hacen cambios a la Constitución de EE.UU.?", answers_en: ["Amendments", "The amendment process"], answers_es: ["Enmiendas", "El proceso de enmiendas"], starred: false },
  { id: 6, section: "Gobierno Americano", subsection: "Principios", q_en: "What does the Bill of Rights protect?", q_es: "¿Qué protege la Declaración de Derechos (Bill of Rights)?", answers_en: ["(The basic) rights of Americans", "(The basic) rights of people living in the United States"], answers_es: ["Los derechos (básicos) de los estadounidenses", "Los derechos (básicos) de las personas que viven en EE.UU."], starred: false },
  { id: 7, section: "Gobierno Americano", subsection: "Principios", q_en: "How many amendments does the U.S. Constitution have?", q_es: "¿Cuántas enmiendas tiene la Constitución de EE.UU.?", answers_en: ["Twenty-seven (27)"], answers_es: ["Veintisiete (27)"], starred: true },
  { id: 8, section: "Gobierno Americano", subsection: "Principios", q_en: "Why is the Declaration of Independence important?", q_es: "¿Por qué es importante la Declaración de Independencia?", answers_en: ["It says America is free from British control.", "It says all people are created equal.", "It identifies inherent rights.", "It identifies individual freedoms."], answers_es: ["Dice que América es libre del control británico.", "Dice que todas las personas son creadas iguales.", "Identifica derechos inherentes.", "Identifica libertades individuales."], starred: false },
  { id: 9, section: "Gobierno Americano", subsection: "Principios", q_en: "What founding document said the American colonies were free from Britain?", q_es: "¿Qué documento fundacional dijo que las colonias americanas eran libres de Gran Bretaña?", answers_en: ["Declaration of Independence"], answers_es: ["La Declaración de Independencia"], starred: false },
  { id: 10, section: "Gobierno Americano", subsection: "Principios", q_en: "Name two important ideas from the Declaration of Independence and the U.S. Constitution.", q_es: "Nombre dos ideas importantes de la Declaración de Independencia y la Constitución de EE.UU.", answers_en: ["Equality", "Liberty", "Social contract", "Natural rights", "Limited government", "Self-government"], answers_es: ["Igualdad", "Libertad", "Contrato social", "Derechos naturales", "Gobierno limitado", "Autogobierno"], starred: false },
  { id: 11, section: "Gobierno Americano", subsection: "Principios", q_en: "The words 'Life, Liberty, and the pursuit of Happiness' are in what founding document?", q_es: "Las palabras 'Vida, Libertad y la búsqueda de la Felicidad' están en qué documento fundacional?", answers_en: ["Declaration of Independence"], answers_es: ["La Declaración de Independencia"], starred: false },
  { id: 12, section: "Gobierno Americano", subsection: "Principios", q_en: "What is the economic system of the United States?", q_es: "¿Cuál es el sistema económico de los Estados Unidos?", answers_en: ["Capitalism", "Free market economy"], answers_es: ["Capitalismo", "Economía de libre mercado"], starred: true },
  { id: 13, section: "Gobierno Americano", subsection: "Principios", q_en: "What is the rule of law?", q_es: "¿Qué es el estado de derecho?", answers_en: ["Everyone must follow the law.", "Leaders must obey the law.", "Government must obey the law.", "No one is above the law."], answers_es: ["Todos deben seguir la ley.", "Los líderes deben obedecer la ley.", "El gobierno debe obedecer la ley.", "Nadie está por encima de la ley."], starred: false },
  { id: 14, section: "Gobierno Americano", subsection: "Principios", q_en: "Many documents influenced the U.S. Constitution. Name one.", q_es: "Muchos documentos influyeron en la Constitución de EE.UU. Nombre uno.", answers_en: ["Declaration of Independence", "Articles of Confederation", "Federalist Papers", "Anti-Federalist Papers", "Virginia Declaration of Rights", "Fundamental Orders of Connecticut", "Mayflower Compact", "Iroquois Great Law of Peace"], answers_es: ["Declaración de Independencia", "Artículos de la Confederación", "Los Documentos Federalistas", "Los Documentos Anti-Federalistas", "Declaración de Derechos de Virginia", "Órdenes Fundamentales de Connecticut", "Pacto del Mayflower", "Gran Ley de Paz Iroquesa"], starred: false },
  { id: 15, section: "Gobierno Americano", subsection: "Principios", q_en: "There are three branches of government. Why?", q_es: "Hay tres ramas del gobierno. ¿Por qué?", answers_en: ["So one part does not become too powerful", "Checks and balances", "Separation of powers"], answers_es: ["Para que una parte no se vuelva demasiado poderosa", "Controles y equilibrios", "Separación de poderes"], starred: false },
  // B: System of Government
  { id: 16, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Name the three branches of government.", q_es: "Nombre las tres ramas del gobierno.", answers_en: ["Legislative, executive, and judicial", "Congress, president, and the courts"], answers_es: ["Legislativa, ejecutiva y judicial", "Congreso, presidente y los tribunales"], starred: false },
  { id: 17, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "The President of the United States is in charge of which branch of government?", q_es: "¿De qué rama del gobierno está a cargo el Presidente de EE.UU.?", answers_en: ["Executive branch"], answers_es: ["La rama ejecutiva"], starred: false },
  { id: 18, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "What part of the federal government writes laws?", q_es: "¿Qué parte del gobierno federal escribe las leyes?", answers_en: ["(U.S.) Congress", "(U.S. or national) legislature", "Legislative branch"], answers_es: ["El Congreso (de EE.UU.)", "La legislatura (de EE.UU. o nacional)", "La rama legislativa"], starred: false },
  { id: 19, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "What are the two parts of the U.S. Congress?", q_es: "¿Cuáles son las dos partes del Congreso de EE.UU.?", answers_en: ["Senate and House (of Representatives)"], answers_es: ["El Senado y la Cámara de Representantes"], starred: false },
  { id: 20, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Name one power of the U.S. Congress.", q_es: "Nombre un poder del Congreso de EE.UU.", answers_en: ["Writes laws", "Declares war", "Makes the federal budget"], answers_es: ["Escribe leyes", "Declara la guerra", "Hace el presupuesto federal"], starred: true },
  { id: 21, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "How many U.S. senators are there?", q_es: "¿Cuántos senadores de EE.UU. hay?", answers_en: ["One hundred (100)"], answers_es: ["Cien (100)"], starred: false },
  { id: 22, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "How long is a term for a U.S. senator?", q_es: "¿Cuánto dura el período de un senador de EE.UU.?", answers_en: ["Six (6) years"], answers_es: ["Seis (6) años"], starred: false },
  { id: 23, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Who is one of your state's U.S. senators now?", q_es: "¿Quién es uno de los senadores de EE.UU. de su estado actualmente?", answers_en: ["Answers will vary by state."], answers_es: ["Las respuestas varían según el estado."], starred: false },
  { id: 24, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "How many voting members are in the House of Representatives?", q_es: "¿Cuántos miembros con derecho a voto hay en la Cámara de Representantes?", answers_en: ["Four hundred thirty-five (435)"], answers_es: ["Cuatrocientos treinta y cinco (435)"], starred: false },
  { id: 25, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "How long is a term for a member of the House of Representatives?", q_es: "¿Cuánto dura el período de un miembro de la Cámara de Representantes?", answers_en: ["Two (2) years"], answers_es: ["Dos (2) años"], starred: false },
  { id: 26, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Why do U.S. representatives serve shorter terms than U.S. senators?", q_es: "¿Por qué los representantes de EE.UU. sirven períodos más cortos que los senadores?", answers_en: ["To more closely follow public opinion"], answers_es: ["Para seguir más de cerca la opinión pública"], starred: false },
  { id: 27, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "How many senators does each state have?", q_es: "¿Cuántos senadores tiene cada estado?", answers_en: ["Two (2)"], answers_es: ["Dos (2)"], starred: false },
  { id: 28, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Why does each state have two senators?", q_es: "¿Por qué cada estado tiene dos senadores?", answers_en: ["Equal representation (for small states)", "The Great Compromise (Connecticut Compromise)"], answers_es: ["Representación igualitaria (para estados pequeños)", "El Gran Compromiso (Compromiso de Connecticut)"], starred: false },
  { id: 29, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Name your U.S. representative.", q_es: "Nombre a su representante de EE.UU.", answers_en: ["Answers will vary by district."], answers_es: ["Las respuestas varían según el distrito."], starred: false },
  { id: 30, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "What is the name of the Speaker of the House of Representatives now?", q_es: "¿Cuál es el nombre del Presidente de la Cámara de Representantes ahora?", answers_en: ["Visit uscis.gov/citizenship/testupdates for current answer."], answers_es: ["Visite uscis.gov/citizenship/testupdates para la respuesta actual."], starred: true },
  { id: 31, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Who does a U.S. senator represent?", q_es: "¿A quién representa un senador de EE.UU.?", answers_en: ["Citizens of their state", "People of their state"], answers_es: ["Los ciudadanos de su estado", "Las personas de su estado"], starred: false },
  { id: 32, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Who elects U.S. senators?", q_es: "¿Quién elige a los senadores de EE.UU.?", answers_en: ["Citizens from their state"], answers_es: ["Los ciudadanos de su estado"], starred: false },
  { id: 33, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Who does a member of the House of Representatives represent?", q_es: "¿A quién representa un miembro de la Cámara de Representantes?", answers_en: ["Citizens in their (congressional) district"], answers_es: ["Los ciudadanos de su distrito (congresional)"], starred: false },
  { id: 34, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Who elects members of the House of Representatives?", q_es: "¿Quién elige a los miembros de la Cámara de Representantes?", answers_en: ["Citizens from their (congressional) district"], answers_es: ["Los ciudadanos de su distrito (congresional)"], starred: false },
  { id: 35, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Some states have more representatives than other states. Why?", q_es: "Algunos estados tienen más representantes que otros. ¿Por qué?", answers_en: ["(Because of) the state's population", "(Because) they have more people"], answers_es: ["(Por) la población del estado", "(Porque) tienen más personas"], starred: false },
  { id: 36, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "The President of the United States is elected for how many years?", q_es: "¿Para cuántos años es elegido el Presidente de EE.UU.?", answers_en: ["Four (4) years"], answers_es: ["Cuatro (4) años"], starred: true },
  { id: 37, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "The President of the United States can serve only two terms. Why?", q_es: "El Presidente de EE.UU. solo puede servir dos períodos. ¿Por qué?", answers_en: ["(Because of) the 22nd Amendment", "To keep the president from becoming too powerful"], answers_es: ["(Por) la Enmienda 22", "Para evitar que el presidente se vuelva demasiado poderoso"], starred: false },
  { id: 38, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "What is the name of the President of the United States now?", q_es: "¿Cuál es el nombre del Presidente de EE.UU. ahora?", answers_en: ["Visit uscis.gov/citizenship/testupdates for current answer."], answers_es: ["Visite uscis.gov/citizenship/testupdates para la respuesta actual."], starred: true },
  { id: 39, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "What is the name of the Vice President of the United States now?", q_es: "¿Cuál es el nombre del Vicepresidente de EE.UU. ahora?", answers_en: ["Visit uscis.gov/citizenship/testupdates for current answer."], answers_es: ["Visite uscis.gov/citizenship/testupdates para la respuesta actual."], starred: true },
  { id: 40, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "If the president can no longer serve, who becomes president?", q_es: "Si el presidente ya no puede servir, ¿quién se convierte en presidente?", answers_en: ["The Vice President (of the United States)"], answers_es: ["El Vicepresidente (de los Estados Unidos)"], starred: false },
  { id: 41, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Name one power of the president.", q_es: "Nombre un poder del presidente.", answers_en: ["Signs bills into law", "Vetoes bills", "Enforces laws", "Commander in Chief (of the military)", "Chief diplomat", "Appoints federal judges"], answers_es: ["Firma proyectos de ley", "Veta proyectos de ley", "Hace cumplir las leyes", "Comandante en Jefe (de las fuerzas armadas)", "Diplomático principal", "Nombra jueces federales"], starred: false },
  { id: 42, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Who is Commander in Chief of the U.S. military?", q_es: "¿Quién es el Comandante en Jefe del ejército de EE.UU.?", answers_en: ["The President (of the United States)"], answers_es: ["El Presidente (de los Estados Unidos)"], starred: false },
  { id: 43, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Who signs bills to become laws?", q_es: "¿Quién firma los proyectos de ley para convertirlos en ley?", answers_en: ["The President (of the United States)"], answers_es: ["El Presidente (de los Estados Unidos)"], starred: false },
  { id: 44, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Who vetoes bills?", q_es: "¿Quién veta los proyectos de ley?", answers_en: ["The President (of the United States)"], answers_es: ["El Presidente (de los Estados Unidos)"], starred: true },
  { id: 45, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Who appoints federal judges?", q_es: "¿Quién nombra a los jueces federales?", answers_en: ["The President (of the United States)"], answers_es: ["El Presidente (de los Estados Unidos)"], starred: false },
  { id: 46, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "The executive branch has many parts. Name one.", q_es: "La rama ejecutiva tiene muchas partes. Nombre una.", answers_en: ["President (of the United States)", "Cabinet", "Federal departments and agencies"], answers_es: ["El Presidente", "El Gabinete", "Departamentos y agencias federales"], starred: false },
  { id: 47, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "What does the President's Cabinet do?", q_es: "¿Qué hace el Gabinete del Presidente?", answers_en: ["Advises the President (of the United States)"], answers_es: ["Aconseja al Presidente (de los Estados Unidos)"], starred: false },
  { id: 48, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "What are two Cabinet-level positions?", q_es: "¿Cuáles son dos posiciones a nivel de Gabinete?", answers_en: ["Attorney General", "Secretary of State", "Secretary of the Treasury", "Secretary of Defense", "Secretary of Education", "Secretary of Energy", "Secretary of Health and Human Services", "Secretary of Homeland Security"], answers_es: ["Fiscal General", "Secretario de Estado", "Secretario del Tesoro", "Secretario de Defensa", "Secretario de Educación", "Secretario de Energía", "Secretario de Salud y Servicios Humanos", "Secretario de Seguridad Nacional"], starred: false },
  { id: 49, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Why is the Electoral College important?", q_es: "¿Por qué es importante el Colegio Electoral?", answers_en: ["It decides who is elected president.", "It provides a compromise between the popular election of the president and congressional selection."], answers_es: ["Decide quién es elegido presidente.", "Provee un compromiso entre la elección popular del presidente y la selección congresional."], starred: false },
  { id: 50, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "What is one part of the judicial branch?", q_es: "¿Cuál es una parte de la rama judicial?", answers_en: ["Supreme Court", "Federal Courts"], answers_es: ["La Corte Suprema", "Los Tribunales Federales"], starred: false },
  { id: 51, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "What does the judicial branch do?", q_es: "¿Qué hace la rama judicial?", answers_en: ["Reviews laws", "Explains laws", "Resolves disputes (disagreements) about the law", "Decides if a law goes against the (U.S.) Constitution"], answers_es: ["Revisa leyes", "Explica leyes", "Resuelve disputas sobre la ley", "Decide si una ley va contra la Constitución"], starred: false },
  { id: 52, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "What is the highest court in the United States?", q_es: "¿Cuál es el tribunal más alto de los Estados Unidos?", answers_en: ["Supreme Court"], answers_es: ["La Corte Suprema"], starred: true },
  { id: 53, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "How many seats are on the Supreme Court?", q_es: "¿Cuántos asientos hay en la Corte Suprema?", answers_en: ["Nine (9)"], answers_es: ["Nueve (9)"], starred: false },
  { id: 54, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "How many Supreme Court justices are usually needed to decide a case?", q_es: "¿Cuántos jueces de la Corte Suprema se necesitan generalmente para decidir un caso?", answers_en: ["Five (5)"], answers_es: ["Cinco (5)"], starred: false },
  { id: 55, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "How long do Supreme Court justices serve?", q_es: "¿Cuánto tiempo sirven los jueces de la Corte Suprema?", answers_en: ["(For) life", "Lifetime appointment", "(Until) retirement"], answers_es: ["De por vida", "Nombramiento vitalicio", "(Hasta la) jubilación"], starred: false },
  { id: 56, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Supreme Court justices serve for life. Why?", q_es: "Los jueces de la Corte Suprema sirven de por vida. ¿Por qué?", answers_en: ["To be independent (of politics)", "To limit outside (political) influence"], answers_es: ["Para ser independientes (de la política)", "Para limitar la influencia externa (política)"], starred: false },
  { id: 57, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Who is the Chief Justice of the United States now?", q_es: "¿Quién es el Presidente de la Corte Suprema de EE.UU. ahora?", answers_en: ["Visit uscis.gov/citizenship/testupdates for current answer."], answers_es: ["Visite uscis.gov/citizenship/testupdates para la respuesta actual."], starred: false },
  { id: 58, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Name one power that is only for the federal government.", q_es: "Nombre un poder que es solo del gobierno federal.", answers_en: ["Print paper money", "Mint coins", "Declare war", "Create an army", "Make treaties", "Set foreign policy"], answers_es: ["Imprimir billetes", "Acuñar monedas", "Declarar la guerra", "Crear un ejército", "Hacer tratados", "Establecer política exterior"], starred: false },
  { id: 59, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Name one power that is only for the states.", q_es: "Nombre un poder que es solo de los estados.", answers_en: ["Provide schooling and education", "Provide protection (police)", "Provide safety (fire departments)", "Give a driver's license", "Approve zoning and land use"], answers_es: ["Proveer educación", "Proveer protección (policía)", "Proveer seguridad (bomberos)", "Dar licencia de conducir", "Aprobar zonificación y uso de tierra"], starred: false },
  { id: 60, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "What is the purpose of the 10th Amendment?", q_es: "¿Cuál es el propósito de la Enmienda 10?", answers_en: ["(It states that the) powers not given to the federal government belong to the states or to the people."], answers_es: ["(Establece que) los poderes no otorgados al gobierno federal pertenecen a los estados o al pueblo."], starred: false },
  { id: 61, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "Who is the governor of your state now?", q_es: "¿Quién es el gobernador de su estado ahora?", answers_en: ["Answers will vary by state."], answers_es: ["Las respuestas varían según el estado."], starred: true },
  { id: 62, section: "Gobierno Americano", subsection: "Sistema de Gobierno", q_en: "What is the capital of your state?", q_es: "¿Cuál es la capital de su estado?", answers_en: ["Answers will vary by state."], answers_es: ["Las respuestas varían según el estado."], starred: false },
  // C: Rights and Responsibilities
  { id: 63, section: "Gobierno Americano", subsection: "Derechos y Responsabilidades", q_en: "There are four amendments to the U.S. Constitution about who can vote. Describe one of them.", q_es: "Hay cuatro enmiendas a la Constitución sobre quién puede votar. Describa una.", answers_en: ["Citizens eighteen (18) and older (can vote).", "You don't have to pay (a poll tax) to vote.", "Any citizen can vote. (Women and men can vote.)", "A male citizen of any race (can vote)."], answers_es: ["Los ciudadanos de dieciocho (18) años o más pueden votar.", "No tiene que pagar un impuesto para votar.", "Cualquier ciudadano puede votar. (Mujeres y hombres pueden votar.)", "Un ciudadano masculino de cualquier raza puede votar."], starred: false },
  { id: 64, section: "Gobierno Americano", subsection: "Derechos y Responsabilidades", q_en: "Who can vote in federal elections, run for federal office, and serve on a jury in the United States?", q_es: "¿Quién puede votar en elecciones federales, postularse para un cargo federal y servir en un jurado?", answers_en: ["Citizens", "Citizens of the United States", "U.S. citizens"], answers_es: ["Los ciudadanos", "Los ciudadanos de los Estados Unidos", "Los ciudadanos estadounidenses"], starred: false },
  { id: 65, section: "Gobierno Americano", subsection: "Derechos y Responsabilidades", q_en: "What are three rights of everyone living in the United States?", q_es: "¿Cuáles son tres derechos de todos los que viven en los Estados Unidos?", answers_en: ["Freedom of expression", "Freedom of speech", "Freedom of assembly", "Freedom to petition the government", "Freedom of religion", "The right to bear arms"], answers_es: ["Libertad de expresión", "Libertad de palabra", "Libertad de reunión", "Libertad de petición al gobierno", "Libertad de religión", "El derecho a portar armas"], starred: false },
  { id: 66, section: "Gobierno Americano", subsection: "Derechos y Responsabilidades", q_en: "What do we show loyalty to when we say the Pledge of Allegiance?", q_es: "¿A qué mostramos lealtad cuando decimos el Juramento de Lealtad?", answers_en: ["The United States", "The flag"], answers_es: ["Los Estados Unidos", "La bandera"], starred: true },
  { id: 67, section: "Gobierno Americano", subsection: "Derechos y Responsabilidades", q_en: "Name two promises that new citizens make in the Oath of Allegiance.", q_es: "Nombre dos promesas que los nuevos ciudadanos hacen en el Juramento de Lealtad.", answers_en: ["Give up loyalty to other countries", "Defend the (U.S.) Constitution", "Obey the laws of the United States", "Serve in the military (if needed)", "Serve (help, do important work for) the nation (if needed)", "Be loyal to the United States"], answers_es: ["Renunciar a la lealtad a otros países", "Defender la Constitución", "Obedecer las leyes de EE.UU.", "Servir en las fuerzas armadas (si es necesario)", "Servir a la nación (si es necesario)", "Ser leal a los Estados Unidos"], starred: false },
  { id: 68, section: "Gobierno Americano", subsection: "Derechos y Responsabilidades", q_en: "How can people become United States citizens?", q_es: "¿Cómo pueden las personas convertirse en ciudadanos de EE.UU.?", answers_en: ["Be born in the United States", "Naturalize", "Derive citizenship (under conditions set by Congress)"], answers_es: ["Nacer en los Estados Unidos", "Naturalizarse", "Derivar ciudadanía (bajo condiciones establecidas por el Congreso)"], starred: false },
  { id: 69, section: "Gobierno Americano", subsection: "Derechos y Responsabilidades", q_en: "What are two examples of civic participation in the United States?", q_es: "¿Cuáles son dos ejemplos de participación cívica en EE.UU.?", answers_en: ["Vote", "Run for office", "Join a political party", "Help with a campaign", "Join a civic group", "Join a community group", "Give an elected official your opinion (on an issue)", "Contact elected officials", "Support or oppose an issue or policy", "Write to a newspaper"], answers_es: ["Votar", "Postularse para un cargo", "Unirse a un partido político", "Ayudar con una campaña", "Unirse a un grupo cívico", "Unirse a un grupo comunitario", "Dar su opinión a un funcionario electo", "Contactar funcionarios electos", "Apoyar u oponerse a un asunto o política", "Escribir a un periódico"], starred: false },
  { id: 70, section: "Gobierno Americano", subsection: "Derechos y Responsabilidades", q_en: "What is one way Americans can serve their country?", q_es: "¿Cuál es una forma en que los estadounidenses pueden servir a su país?", answers_en: ["Vote", "Pay taxes", "Obey the law", "Serve in the military", "Run for office", "Work for local, state, or federal government"], answers_es: ["Votar", "Pagar impuestos", "Obedecer la ley", "Servir en las fuerzas armadas", "Postularse para un cargo", "Trabajar para el gobierno"], starred: false },
  { id: 71, section: "Gobierno Americano", subsection: "Derechos y Responsabilidades", q_en: "Why is it important to pay federal taxes?", q_es: "¿Por qué es importante pagar impuestos federales?", answers_en: ["Required by law", "All people pay to fund the federal government", "Required by the (U.S.) Constitution (16th Amendment)", "Civic duty"], answers_es: ["Es requerido por ley", "Todos pagan para financiar el gobierno federal", "Es requerido por la Constitución (Enmienda 16)", "Deber cívico"], starred: false },
  { id: 72, section: "Gobierno Americano", subsection: "Derechos y Responsabilidades", q_en: "It is important for all men age 18 through 25 to register for the Selective Service. Name one reason why.", q_es: "Es importante que todos los hombres de 18 a 25 años se registren en el Servicio Selectivo. Nombre una razón.", answers_en: ["Required by law", "Civic duty", "Makes the draft fair, if needed"], answers_es: ["Es requerido por ley", "Deber cívico", "Hace el reclutamiento justo, si es necesario"], starred: false },
  // AMERICAN HISTORY
  { id: 73, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "The colonists came to America for many reasons. Name one.", q_es: "Los colonos vinieron a América por muchas razones. Nombre una.", answers_en: ["Freedom", "Political liberty", "Religious freedom", "Economic opportunity", "Escape persecution"], answers_es: ["Libertad", "Libertad política", "Libertad religiosa", "Oportunidad económica", "Escapar de la persecución"], starred: false },
  { id: 74, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "Who lived in America before the Europeans arrived?", q_es: "¿Quiénes vivían en América antes de que llegaran los europeos?", answers_en: ["American Indians", "Native Americans"], answers_es: ["Los indios americanos", "Los nativos americanos"], starred: true },
  { id: 75, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "What group of people was taken and sold as slaves?", q_es: "¿Qué grupo de personas fue tomado y vendido como esclavos?", answers_en: ["Africans", "People from Africa"], answers_es: ["Africanos", "Personas de África"], starred: false },
  { id: 76, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "What war did the Americans fight to win independence from Britain?", q_es: "¿Qué guerra pelearon los americanos para ganar la independencia de Gran Bretaña?", answers_en: ["American Revolution", "The (American) Revolutionary War", "War for (American) Independence"], answers_es: ["La Revolución Americana", "La Guerra Revolucionaria (Americana)", "La Guerra por la Independencia (Americana)"], starred: false },
  { id: 77, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "Name one reason why the Americans declared independence from Britain.", q_es: "Nombre una razón por la que los americanos declararon la independencia de Gran Bretaña.", answers_en: ["High taxes", "Taxation without representation", "British soldiers stayed in Americans' houses", "They did not have self-government", "Boston Massacre", "Boston Tea Party (Tea Act)", "Stamp Act", "Sugar Act", "Townshend Acts", "Intolerable (Coercive) Acts"], answers_es: ["Impuestos altos", "Impuestos sin representación", "Los soldados británicos se alojaban en casas americanas", "No tenían autogobierno", "La Masacre de Boston", "El Motín del Té de Boston", "La Ley del Timbre", "La Ley del Azúcar", "Las Leyes de Townshend", "Las Leyes Intolerables"], starred: false },
  { id: 78, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "Who wrote the Declaration of Independence?", q_es: "¿Quién escribió la Declaración de Independencia?", answers_en: ["(Thomas) Jefferson"], answers_es: ["(Thomas) Jefferson"], starred: true },
  { id: 79, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "When was the Declaration of Independence adopted?", q_es: "¿Cuándo fue adoptada la Declaración de Independencia?", answers_en: ["July 4, 1776"], answers_es: ["4 de julio de 1776"], starred: false },
  { id: 80, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "The American Revolution had many important events. Name one.", q_es: "La Revolución Americana tuvo muchos eventos importantes. Nombre uno.", answers_en: ["(Battle of) Bunker Hill", "Declaration of Independence", "Washington Crossing the Delaware (Battle of Trenton)", "(Battle of) Saratoga", "Valley Forge (Encampment)", "(Battle of) Yorktown"], answers_es: ["(Batalla de) Bunker Hill", "Declaración de Independencia", "Washington cruzando el Delaware (Batalla de Trenton)", "(Batalla de) Saratoga", "Valley Forge (Campamento)", "(Batalla de) Yorktown"], starred: false },
  { id: 81, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "There were 13 original states. Name five.", q_es: "Había 13 estados originales. Nombre cinco.", answers_en: ["New Hampshire", "Massachusetts", "Rhode Island", "Connecticut", "New York", "New Jersey", "Pennsylvania", "Delaware", "Maryland", "Virginia", "North Carolina", "South Carolina", "Georgia"], answers_es: ["New Hampshire", "Massachusetts", "Rhode Island", "Connecticut", "New York", "New Jersey", "Pennsylvania", "Delaware", "Maryland", "Virginia", "Carolina del Norte", "Carolina del Sur", "Georgia"], starred: false },
  { id: 82, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "What founding document was written in 1787?", q_es: "¿Qué documento fundacional fue escrito en 1787?", answers_en: ["(U.S.) Constitution"], answers_es: ["La Constitución (de EE.UU.)"], starred: false },
  { id: 83, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "The Federalist Papers supported the passage of the U.S. Constitution. Name one of the writers.", q_es: "Los Documentos Federalistas apoyaron la aprobación de la Constitución. Nombre uno de los escritores.", answers_en: ["(James) Madison", "(Alexander) Hamilton", "(John) Jay", "Publius"], answers_es: ["(James) Madison", "(Alexander) Hamilton", "(John) Jay", "Publius"], starred: false },
  { id: 84, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "Why were the Federalist Papers important?", q_es: "¿Por qué fueron importantes los Documentos Federalistas?", answers_en: ["They helped people understand the (U.S.) Constitution.", "They supported passing the (U.S.) Constitution."], answers_es: ["Ayudaron a las personas a entender la Constitución.", "Apoyaron la aprobación de la Constitución."], starred: false },
  { id: 85, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "Benjamin Franklin is famous for many things. Name one.", q_es: "Benjamin Franklin es famoso por muchas cosas. Nombre una.", answers_en: ["Founded the first free public libraries", "First Postmaster General of the United States", "Helped write the Declaration of Independence", "Inventor", "U.S. diplomat"], answers_es: ["Fundó las primeras bibliotecas públicas gratuitas", "Primer Director General de Correos de EE.UU.", "Ayudó a escribir la Declaración de Independencia", "Inventor", "Diplomático de EE.UU."], starred: false },
  { id: 86, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "George Washington is famous for many things. Name one.", q_es: "George Washington es famoso por muchas cosas. Nombre una.", answers_en: ['"Father of Our Country"', "First president of the United States", "General of the Continental Army", "President of the Constitutional Convention"], answers_es: ['"Padre de Nuestra Nación"', "Primer presidente de los Estados Unidos", "General del Ejército Continental", "Presidente de la Convención Constitucional"], starred: true },
  { id: 87, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "Thomas Jefferson is famous for many things. Name one.", q_es: "Thomas Jefferson es famoso por muchas cosas. Nombre una.", answers_en: ["Writer of the Declaration of Independence", "Third president of the United States", "Doubled the size of the United States (Louisiana Purchase)", "First Secretary of State", "Founded the University of Virginia"], answers_es: ["Escritor de la Declaración de Independencia", "Tercer presidente de EE.UU.", "Duplicó el tamaño de EE.UU. (Compra de Luisiana)", "Primer Secretario de Estado", "Fundó la Universidad de Virginia"], starred: false },
  { id: 88, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "James Madison is famous for many things. Name one.", q_es: "James Madison es famoso por muchas cosas. Nombre una.", answers_en: ['"Father of the Constitution"', "Fourth president of the United States", "President during the War of 1812", "One of the writers of the Federalist Papers"], answers_es: ['"Padre de la Constitución"', "Cuarto presidente de EE.UU.", "Presidente durante la Guerra de 1812", "Uno de los escritores de los Documentos Federalistas"], starred: false },
  { id: 89, section: "Historia Americana", subsection: "Periodo Colonial e Independencia", q_en: "Alexander Hamilton is famous for many things. Name one.", q_es: "Alexander Hamilton es famoso por muchas cosas. Nombre una.", answers_en: ["First Secretary of the Treasury", "One of the writers of the Federalist Papers", "Helped establish the First Bank of the United States", "Aide to General George Washington", "Member of the Continental Congress"], answers_es: ["Primer Secretario del Tesoro", "Uno de los escritores de los Documentos Federalistas", "Ayudó a establecer el Primer Banco de EE.UU.", "Asistente del General George Washington", "Miembro del Congreso Continental"], starred: false },
  { id: 90, section: "Historia Americana", subsection: "Siglo XIX (1800s)", q_en: "What territory did the United States buy from France in 1803?", q_es: "¿Qué territorio compró EE.UU. de Francia en 1803?", answers_en: ["Louisiana Territory", "Louisiana"], answers_es: ["El Territorio de Luisiana", "Luisiana"], starred: false },
  { id: 91, section: "Historia Americana", subsection: "Siglo XIX (1800s)", q_en: "Name one war fought by the United States in the 1800s.", q_es: "Nombre una guerra peleada por EE.UU. en los 1800s.", answers_en: ["War of 1812", "Mexican-American War", "Civil War", "Spanish-American War"], answers_es: ["Guerra de 1812", "Guerra México-Americana", "Guerra Civil", "Guerra Hispano-Americana"], starred: false },
  { id: 92, section: "Historia Americana", subsection: "Siglo XIX (1800s)", q_en: "Name the U.S. war between the North and the South.", q_es: "Nombre la guerra de EE.UU. entre el Norte y el Sur.", answers_en: ["The Civil War"], answers_es: ["La Guerra Civil"], starred: false },
  { id: 93, section: "Historia Americana", subsection: "Siglo XIX (1800s)", q_en: "The Civil War had many important events. Name one.", q_es: "La Guerra Civil tuvo muchos eventos importantes. Nombre uno.", answers_en: ["(Battle of) Fort Sumter", "Emancipation Proclamation", "(Battle of) Vicksburg", "(Battle of) Gettysburg", "Sherman's March", "(Surrender at) Appomattox", "(Battle of) Antietam/Sharpsburg", "Lincoln was assassinated."], answers_es: ["(Batalla de) Fort Sumter", "Proclamación de Emancipación", "(Batalla de) Vicksburg", "(Batalla de) Gettysburg", "La Marcha de Sherman", "(Rendición en) Appomattox", "(Batalla de) Antietam/Sharpsburg", "Lincoln fue asesinado."], starred: false },
  { id: 94, section: "Historia Americana", subsection: "Siglo XIX (1800s)", q_en: "Abraham Lincoln is famous for many things. Name one.", q_es: "Abraham Lincoln es famoso por muchas cosas. Nombre una.", answers_en: ["Freed the slaves (Emancipation Proclamation)", "Saved (or preserved) the Union", "Led the United States during the Civil War", "16th president of the United States", "Delivered the Gettysburg Address"], answers_es: ["Liberó a los esclavos (Proclamación de Emancipación)", "Salvó (o preservó) la Unión", "Dirigió a EE.UU. durante la Guerra Civil", "16o presidente de EE.UU.", "Pronunció el Discurso de Gettysburg"], starred: true },
  { id: 95, section: "Historia Americana", subsection: "Siglo XIX (1800s)", q_en: "What did the Emancipation Proclamation do?", q_es: "¿Qué hizo la Proclamación de Emancipación?", answers_en: ["Freed the slaves", "Freed slaves in the Confederacy", "Freed slaves in the Confederate states", "Freed slaves in most Southern states"], answers_es: ["Liberó a los esclavos", "Liberó esclavos en la Confederación", "Liberó esclavos en los estados Confederados", "Liberó esclavos en la mayoría de los estados del Sur"], starred: false },
  { id: 96, section: "Historia Americana", subsection: "Siglo XIX (1800s)", q_en: "What U.S. war ended slavery?", q_es: "¿Qué guerra de EE.UU. terminó con la esclavitud?", answers_en: ["The Civil War"], answers_es: ["La Guerra Civil"], starred: false },
  { id: 97, section: "Historia Americana", subsection: "Siglo XIX (1800s)", q_en: "What amendment says all persons born or naturalized in the United States are U.S. citizens?", q_es: "¿Qué enmienda dice que todas las personas nacidas o naturalizadas en EE.UU. son ciudadanos?", answers_en: ["14th Amendment"], answers_es: ["La Enmienda 14"], starred: false },
  { id: 98, section: "Historia Americana", subsection: "Siglo XIX (1800s)", q_en: "When did all men get the right to vote?", q_es: "¿Cuándo obtuvieron todos los hombres el derecho a votar?", answers_en: ["After the Civil War", "During Reconstruction", "(With the) 15th Amendment", "1870"], answers_es: ["Después de la Guerra Civil", "Durante la Reconstrucción", "(Con la) Enmienda 15", "1870"], starred: false },
  { id: 99, section: "Historia Americana", subsection: "Siglo XIX (1800s)", q_en: "Name one leader of the women's rights movement in the 1800s.", q_es: "Nombre un líder del movimiento por los derechos de la mujer en los 1800s.", answers_en: ["Susan B. Anthony", "Elizabeth Cady Stanton", "Sojourner Truth", "Harriet Tubman", "Lucretia Mott", "Lucy Stone"], answers_es: ["Susan B. Anthony", "Elizabeth Cady Stanton", "Sojourner Truth", "Harriet Tubman", "Lucretia Mott", "Lucy Stone"], starred: false },
  { id: 100, section: "Historia Americana", subsection: "Historia Reciente", q_en: "Name one war fought by the United States in the 1900s.", q_es: "Nombre una guerra peleada por EE.UU. en los 1900s.", answers_en: ["World War I", "World War II", "Korean War", "Vietnam War", "(Persian) Gulf War"], answers_es: ["Primera Guerra Mundial", "Segunda Guerra Mundial", "Guerra de Corea", "Guerra de Vietnam", "Guerra del Golfo (Pérsico)"], starred: false },
  { id: 101, section: "Historia Americana", subsection: "Historia Reciente", q_en: "Why did the United States enter World War I?", q_es: "¿Por qué entró EE.UU. en la Primera Guerra Mundial?", answers_en: ["Because Germany attacked U.S. (civilian) ships", "To support the Allied Powers", "To oppose the Central Powers"], answers_es: ["Porque Alemania atacó barcos (civiles) de EE.UU.", "Para apoyar a las Potencias Aliadas", "Para oponerse a las Potencias Centrales"], starred: false },
  { id: 102, section: "Historia Americana", subsection: "Historia Reciente", q_en: "When did all women get the right to vote?", q_es: "¿Cuándo obtuvieron todas las mujeres el derecho a votar?", answers_en: ["1920", "After World War I", "(With the) 19th Amendment"], answers_es: ["1920", "Después de la Primera Guerra Mundial", "(Con la) Enmienda 19"], starred: false },
  { id: 103, section: "Historia Americana", subsection: "Historia Reciente", q_en: "What was the Great Depression?", q_es: "¿Qué fue la Gran Depresión?", answers_en: ["Longest economic recession in modern history"], answers_es: ["La recesión económica más larga de la historia moderna"], starred: false },
  { id: 104, section: "Historia Americana", subsection: "Historia Reciente", q_en: "When did the Great Depression start?", q_es: "¿Cuándo comenzó la Gran Depresión?", answers_en: ["The Great Crash (1929)", "Stock market crash of 1929"], answers_es: ["El Gran Crack (1929)", "La caída de la bolsa de valores de 1929"], starred: false },
  { id: 105, section: "Historia Americana", subsection: "Historia Reciente", q_en: "Who was president during the Great Depression and World War II?", q_es: "¿Quién fue presidente durante la Gran Depresión y la Segunda Guerra Mundial?", answers_en: ["(Franklin) Roosevelt"], answers_es: ["(Franklin) Roosevelt"], starred: false },
  { id: 106, section: "Historia Americana", subsection: "Historia Reciente", q_en: "Why did the United States enter World War II?", q_es: "¿Por qué entró EE.UU. en la Segunda Guerra Mundial?", answers_en: ["(Bombing of) Pearl Harbor", "Japanese attacked Pearl Harbor", "To support the Allied Powers", "To oppose the Axis Powers"], answers_es: ["(Bombardeo de) Pearl Harbor", "Los japoneses atacaron Pearl Harbor", "Para apoyar a las Potencias Aliadas", "Para oponerse a las Potencias del Eje"], starred: false },
  { id: 107, section: "Historia Americana", subsection: "Historia Reciente", q_en: "Dwight Eisenhower is famous for many things. Name one.", q_es: "Dwight Eisenhower es famoso por muchas cosas. Nombre una.", answers_en: ["General during World War II", "President at the end of (during) the Korean War", "34th president of the United States", "Signed the Federal-Aid Highway Act of 1956"], answers_es: ["General durante la Segunda Guerra Mundial", "Presidente al final de la Guerra de Corea", "34o presidente de EE.UU.", "Firmó la Ley Federal de Carreteras de 1956"], starred: false },
  { id: 108, section: "Historia Americana", subsection: "Historia Reciente", q_en: "Who was the United States' main rival during the Cold War?", q_es: "¿Quién fue el principal rival de EE.UU. durante la Guerra Fría?", answers_en: ["Soviet Union", "USSR", "Russia"], answers_es: ["La Unión Soviética", "La URSS", "Rusia"], starred: false },
  { id: 109, section: "Historia Americana", subsection: "Historia Reciente", q_en: "During the Cold War, what was one main concern of the United States?", q_es: "Durante la Guerra Fría, ¿cuál era una preocupación principal de EE.UU.?", answers_en: ["Communism", "Nuclear war"], answers_es: ["El comunismo", "La guerra nuclear"], starred: false },
  { id: 110, section: "Historia Americana", subsection: "Historia Reciente", q_en: "Why did the United States enter the Korean War?", q_es: "¿Por qué entró EE.UU. en la Guerra de Corea?", answers_en: ["To stop the spread of communism"], answers_es: ["Para detener la propagación del comunismo"], starred: false },
  { id: 111, section: "Historia Americana", subsection: "Historia Reciente", q_en: "Why did the United States enter the Vietnam War?", q_es: "¿Por qué entró EE.UU. en la Guerra de Vietnam?", answers_en: ["To stop the spread of communism"], answers_es: ["Para detener la propagación del comunismo"], starred: false },
  { id: 112, section: "Historia Americana", subsection: "Historia Reciente", q_en: "What did the civil rights movement do?", q_es: "¿Qué hizo el movimiento de derechos civiles?", answers_en: ["Fought to end racial discrimination"], answers_es: ["Luchó para acabar con la discriminación racial"], starred: false },
  { id: 113, section: "Historia Americana", subsection: "Historia Reciente", q_en: "Martin Luther King, Jr. is famous for many things. Name one.", q_es: "Martin Luther King, Jr. es famoso por muchas cosas. Nombre una.", answers_en: ["Fought for civil rights", "Worked for equality for all Americans"], answers_es: ["Luchó por los derechos civiles", "Trabajó por la igualdad para todos los estadounidenses"], starred: true },
  { id: 114, section: "Historia Americana", subsection: "Historia Reciente", q_en: "Why did the United States enter the Persian Gulf War?", q_es: "¿Por qué entró EE.UU. en la Guerra del Golfo Pérsico?", answers_en: ["To force the Iraqi military from Kuwait"], answers_es: ["Para sacar al ejército iraquí de Kuwait"], starred: false },
  { id: 115, section: "Historia Americana", subsection: "Historia Reciente", q_en: "What major event happened on September 11, 2001 in the United States?", q_es: "¿Qué evento importante ocurrió el 11 de septiembre de 2001 en EE.UU.?", answers_en: ["Terrorists attacked the United States"], answers_es: ["Terroristas atacaron los Estados Unidos"], starred: true },
  { id: 116, section: "Historia Americana", subsection: "Historia Reciente", q_en: "Name one U.S. military conflict after the September 11, 2001 attacks.", q_es: "Nombre un conflicto militar de EE.UU. después de los ataques del 11 de septiembre de 2001.", answers_en: ["(Global) War on Terror", "War in Afghanistan", "War in Iraq"], answers_es: ["Guerra (Global) contra el Terrorismo", "Guerra en Afganistán", "Guerra en Irak"], starred: false },
  { id: 117, section: "Historia Americana", subsection: "Historia Reciente", q_en: "Name one American Indian tribe in the United States.", q_es: "Nombre una tribu indígena americana en los Estados Unidos.", answers_en: ["Apache", "Cherokee", "Cheyenne", "Choctaw", "Navajo", "Seminole", "Sioux", "Lakota", "Mohawk", "Hopi"], answers_es: ["Apache", "Cherokee", "Cheyenne", "Choctaw", "Navajo", "Seminole", "Sioux", "Lakota", "Mohawk", "Hopi"], starred: false },
  { id: 118, section: "Historia Americana", subsection: "Historia Reciente", q_en: "Name one example of an American innovation.", q_es: "Nombre un ejemplo de una innovación americana.", answers_en: ["Light bulb", "Automobile (cars, internal combustion engine)", "Skyscrapers", "Airplane", "Assembly line", "Landing on the moon", "Integrated circuit (IC)"], answers_es: ["Bombilla eléctrica", "Automóvil (carros, motor de combustión interna)", "Rascacielos", "Avión", "Línea de ensamblaje", "Aterrizaje en la luna", "Circuito integrado (IC)"], starred: false },
  // SYMBOLS AND HOLIDAYS
  { id: 119, section: "Símbolos y Feriados", subsection: "Símbolos", q_en: "What is the capital of the United States?", q_es: "¿Cuál es la capital de los Estados Unidos?", answers_en: ["Washington, D.C."], answers_es: ["Washington, D.C."], starred: false },
  { id: 120, section: "Símbolos y Feriados", subsection: "Símbolos", q_en: "Where is the Statue of Liberty?", q_es: "¿Dónde está la Estatua de la Libertad?", answers_en: ["New York (Harbor)", "Liberty Island"], answers_es: ["Puerto de Nueva York", "Isla de la Libertad"], starred: false },
  { id: 121, section: "Símbolos y Feriados", subsection: "Símbolos", q_en: "Why does the flag have 13 stripes?", q_es: "¿Por qué la bandera tiene 13 franjas?", answers_en: ["(Because there were) 13 original colonies", "(Because the stripes) represent the original colonies"], answers_es: ["(Porque había) 13 colonias originales", "(Porque las franjas) representan las colonias originales"], starred: true },
  { id: 122, section: "Símbolos y Feriados", subsection: "Símbolos", q_en: "Why does the flag have 50 stars?", q_es: "¿Por qué la bandera tiene 50 estrellas?", answers_en: ["(Because there is) one star for each state", "(Because) each star represents a state", "(Because there are) 50 states"], answers_es: ["(Porque hay) una estrella por cada estado", "(Porque) cada estrella representa un estado", "(Porque hay) 50 estados"], starred: false },
  { id: 123, section: "Símbolos y Feriados", subsection: "Símbolos", q_en: "What is the name of the national anthem?", q_es: "¿Cuál es el nombre del himno nacional?", answers_en: ["The Star-Spangled Banner"], answers_es: ["The Star-Spangled Banner (La Bandera Adornada de Estrellas)"], starred: false },
  { id: 124, section: "Símbolos y Feriados", subsection: "Símbolos", q_en: "The Nation's first motto was 'E Pluribus Unum.' What does that mean?", q_es: "El primer lema de la nación fue 'E Pluribus Unum'. ¿Qué significa?", answers_en: ["Out of many, one", "We all become one"], answers_es: ["De muchos, uno", "Todos nos convertimos en uno"], starred: false },
  { id: 125, section: "Símbolos y Feriados", subsection: "Feriados", q_en: "What is Independence Day?", q_es: "¿Qué es el Día de la Independencia?", answers_en: ["A holiday to celebrate U.S. independence (from Britain)", "The country's birthday"], answers_es: ["Un día festivo para celebrar la independencia de EE.UU. (de Gran Bretaña)", "El cumpleaños del país"], starred: false },
  { id: 126, section: "Símbolos y Feriados", subsection: "Feriados", q_en: "Name three national U.S. holidays.", q_es: "Nombre tres días festivos nacionales de EE.UU.", answers_en: ["New Year's Day", "Martin Luther King, Jr. Day", "Presidents Day", "Memorial Day", "Independence Day", "Labor Day", "Columbus Day", "Veterans Day", "Thanksgiving Day", "Christmas Day"], answers_es: ["Día de Año Nuevo", "Día de Martin Luther King, Jr.", "Día de los Presidentes", "Día de los Caídos", "Día de la Independencia", "Día del Trabajo", "Día de la Raza", "Día de los Veteranos", "Día de Acción de Gracias", "Día de Navidad"], starred: true },
  { id: 127, section: "Símbolos y Feriados", subsection: "Feriados", q_en: "What is Memorial Day?", q_es: "¿Qué es el Día de los Caídos (Memorial Day)?", answers_en: ["A holiday to honor soldiers who died in military service"], answers_es: ["Un día festivo para honrar a los soldados que murieron en servicio militar"], starred: false },
  { id: 128, section: "Símbolos y Feriados", subsection: "Feriados", q_en: "What is Veterans Day?", q_es: "¿Qué es el Día de los Veteranos?", answers_en: ["A holiday to honor people in the (U.S.) military", "A holiday to honor people who have served (in the U.S. military)"], answers_es: ["Un día festivo para honrar a las personas en las fuerzas armadas de EE.UU.", "Un día festivo para honrar a las personas que han servido en las fuerzas armadas de EE.UU."], starred: false },
];

const ELIGIBILITY_QUESTIONS = [
  { id: "age", text: "¿Tiene 18 años de edad o más?", help: "Debe tener al menos 18 años para aplicar a la naturalización.", disqualifyMsg: "Debe tener al menos 18 años para aplicar. Si es menor de 18, puede derivar ciudadanía a través de sus padres ciudadanos bajo ciertas condiciones." },
  { id: "lpr", text: "¿Es usted Residente Permanente Legal (tiene Green Card)?", help: "Debe tener estatus de Residente Permanente Legal (tarjeta verde) para aplicar.", disqualifyMsg: "Debe obtener primero su Residencia Permanente Legal (Green Card) antes de poder solicitar la naturalización. Consulte uscis.gov para más información sobre cómo obtener la residencia permanente." },
  { id: "lpr_time", text: "¿Ha sido Residente Permanente por al menos 5 años? (o 3 años si está casado/a con un ciudadano/a estadounidense)", help: "Se requiere un período mínimo de residencia permanente. 5 años para la mayoría, 3 años si está casado/a con un ciudadano/a de EE.UU.", disqualifyMsg: "Aún no cumple el tiempo mínimo requerido de residencia permanente. Puede presentar su solicitud 90 días antes de completar el requisito de residencia continua. Use la calculadora de USCIS en uscis.gov para determinar su fecha más temprana de solicitud." },
  { id: "continuous", text: "¿Ha residido continuamente en Estados Unidos durante ese período?", help: "Debe demostrar que ha vivido continuamente en EE.UU. durante los últimos 5 años (o 3 años). Ausencias de más de 6 meses pueden interrumpir la residencia continua.", disqualifyMsg: "Debe demostrar residencia continua. Si ha viajado fuera de EE.UU. por períodos largos (más de 6 meses), esto puede afectar su elegibilidad. Consulte con un abogado de inmigración." },
  { id: "physical", text: "¿Ha estado físicamente presente en EE.UU. por al menos 30 meses de los últimos 5 años? (o 18 meses de los últimos 3 años)", help: "Además de residir continuamente, debe haber estado físicamente en el territorio de EE.UU. al menos la mitad del período requerido.", disqualifyMsg: "No cumple el requisito de presencia física. Debe haber estado físicamente en EE.UU. por al menos la mitad del período requerido. Puede necesitar esperar más tiempo antes de aplicar." },
  { id: "state", text: "¿Ha vivido en su estado o distrito de USCIS actual por al menos 3 meses?", help: "Debe haber vivido al menos 3 meses en el estado o distrito de USCIS donde presentará su solicitud.", disqualifyMsg: "Debe residir al menos 3 meses en su estado o distrito de USCIS actual antes de presentar su solicitud ahí." },
  { id: "english", text: "¿Puede leer, escribir y hablar inglés básico?", help: "Debe poder demostrar capacidad básica en inglés (lectura, escritura y conversación). Hay excepciones para personas de 50+ años con 20+ años de residencia permanente, o de 55+ años con 15+ años de residencia permanente.", disqualifyMsg: "Necesita demostrar conocimiento básico de inglés. Sin embargo, hay excepciones: si tiene 50+ años con 20+ años como residente permanente, o 55+ años con 15+ años, puede estar exento. Consulte uscis.gov/citizenship para excepciones." },
  { id: "moral", text: "¿Ha mantenido buen carácter moral? (Sin condenas graves, sin fraude, cumple con impuestos, etc.)", help: "USCIS evaluará su carácter moral de forma integral: historial criminal, cumplimiento fiscal, participación comunitaria, y conducta general. Desde 2025, la evaluación es más estricta.", disqualifyMsg: "Problemas de carácter moral pueden impedir su naturalización. Consulte con un abogado de inmigración para evaluar su situación específica antes de presentar la solicitud." },
  { id: "civics", text: "¿Está dispuesto/a a estudiar y tomar el examen de educación cívica e historia de EE.UU.?", help: "Debe aprobar un examen de 128 preguntas sobre gobierno e historia de EE.UU. Le harán hasta 20 preguntas y debe responder al menos 12 correctamente.", disqualifyMsg: "El examen cívico es obligatorio. ¡Esta aplicación le ayudará a prepararse! Continúe con su proceso y use la sección de estudio para practicar." },
  { id: "oath", text: "¿Está dispuesto/a a tomar el Juramento de Lealtad a los Estados Unidos?", help: "Al naturalizarse, debe jurar lealtad a los Estados Unidos, renunciar a lealtad a otros países, y comprometerse a defender la Constitución.", disqualifyMsg: "El Juramento de Lealtad es requisito para completar la naturalización. Si tiene objeciones religiosas o de conciencia a ciertas partes del juramento, pueden existir acomodaciones. Consulte con USCIS." }
];

const PROCESS_STEPS = [
  { id: 1, title: "Verificar Elegibilidad", desc: "Confirme que cumple todos los requisitos de elegibilidad para la naturalización.", details: "Use la sección de Elegibilidad de esta aplicación o visite uscis.gov/citizenship para verificar que cumple con todos los requisitos: edad, tiempo de residencia permanente, residencia continua, presencia física, buen carácter moral, y conocimiento de inglés y educación cívica.", icon: "shield" },
  { id: 2, title: "Preparar Documentos", desc: "Reúna todos los documentos necesarios antes de llenar la solicitud.", details: "Documentos necesarios: copia de su Green Card (ambos lados), 2 fotos tamaño pasaporte, evidencia de viajes fuera de EE.UU., registros de impuestos (últimos 5 años), certificado de matrimonio (si aplica), registros de Selective Service (hombres 18-25), y cualquier documento de cambio de nombre.", icon: "file" },
  { id: 3, title: "Llenar Formulario N-400", desc: "Complete la Solicitud de Naturalización (Form N-400) con precisión.", details: "El formulario N-400 se puede llenar en línea en uscis.gov o en papel. Sea preciso y honesto en todas las respuestas. El costo actual es de $760. Si necesita ayuda, considere consultar con un abogado de inmigración autorizado.", icon: "clipboard" },
  { id: 4, title: "Enviar Solicitud y Pago", desc: "Envíe su formulario N-400 con el pago correspondiente a USCIS.", details: "Puede enviar en línea o por correo. El pago de $760 incluye la tarifa de biométricos. Si no puede pagar, puede solicitar una exención de tarifa (Fee Waiver) con el formulario I-912. Guarde una copia de todo lo que envíe.", icon: "dollar" },
  { id: 5, title: "Cita de Biométricos", desc: "Asista a su cita para toma de huellas digitales y fotografía.", details: "USCIS le enviará una notificación (Form I-797C) con la fecha, hora y lugar de su cita de biométricos. Es generalmente 1-2 meses después de enviar su solicitud. Lleve su Green Card y la notificación de cita. No falte a esta cita.", icon: "target" },
  { id: 6, title: "Estudiar para el Examen", desc: "Prepare el examen de educación cívica (128 preguntas) y el examen de inglés.", details: "El examen cívico 2025 tiene 128 preguntas. Le harán hasta 20 y debe acertar al menos 12. También habrá un examen de lectura, escritura y conversación en inglés. Use la sección de Aprendizaje de esta aplicación para practicar.", icon: "book" },
  { id: 7, title: "Entrevista con USCIS", desc: "Asista a su entrevista de naturalización en la oficina de USCIS.", details: "En la entrevista, un oficial de USCIS revisará su solicitud N-400, verificará sus respuestas, evaluará su inglés, y le administrará el examen cívico. Lleve todos sus documentos originales, su Green Card, y la notificación de entrevista. Llegue con tiempo.", icon: "message" },
  { id: 8, title: "Recibir Decisión", desc: "USCIS le notificará si su solicitud fue aprobada, denegada, o continuada.", details: "Después de la entrevista recibirá un Form N-652 con el resultado. Si es aprobado, recibirá información sobre la ceremonia. Si es continuado, puede necesitar proveer documentos adicionales o retomar el examen. Si es denegado, puede apelar.", icon: "check" },
  { id: 9, title: "Ceremonia de Juramento", desc: "Asista a la ceremonia de naturalización y tome el Juramento de Lealtad.", details: "Esta es la etapa final. Tomará el Juramento de Lealtad a los Estados Unidos, entregará su Green Card, y recibirá su Certificado de Naturalización (Form N-550). ¡Felicidades, ahora es ciudadano/a estadounidense!", icon: "award" },
  { id: 10, title: "Después de la Ciudadanía", desc: "Pasos importantes después de convertirse en ciudadano/a.", details: "Registrarse para votar, solicitar un pasaporte estadounidense (formulario DS-11), actualizar su información en el Seguro Social, y considerar registrarse para servicio de jurado. Guarde su Certificado de Naturalización en un lugar seguro.", icon: "flag" }
];

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────

const T = {
  ink: "#0B1220",
  ink2: "#131D30",
  ink3: "#1C2942",
  paper: "#F4F6F8",
  card: "#FFFFFF",
  gold: "#C8A24A",
  text: "#0B1220",
  muted: "#5B6779",
  faint: "#8A94A6",
  line: "#E1E6EC",
  lineDark: "rgba(255,255,255,0.16)",
};

const PATHS = {
  eligibility: {
    n: "01", key: "eligibility",
    title: "Elegibilidad",
    titleEn: "Eligibility",
    lede: "Diez preguntas para saber si califica hoy, o qué le falta.",
    accent: "#2F6FE4", accentDeep: "#1B4FB0", accentSoft: "#E8F0FE",
  },
  process: {
    n: "02", key: "process",
    title: "El Proceso",
    titleEn: "The Process",
    lede: "Diez pasos, desde reunir documentos hasta el juramento final.",
    accent: "#12776A", accentDeep: "#0B554B", accentSoft: "#E4F2EF",
  },
  study: {
    n: "03", key: "study",
    title: "Estudio",
    titleEn: "Study",
    lede: "Las 128 preguntas del examen cívico, en inglés y español.",
    accent: "#B26B12", accentDeep: "#8A5210", accentSoft: "#FBF0E2",
  },
  simulation: {
    n: "04", key: "simulation",
    title: "Simulación",
    titleEn: "Interview",
    lede: "Practique la entrevista como la vivirá frente al oficial.",
    accent: "#A32F42", accentDeep: "#7C2231", accentSoft: "#FBEAED",
  },
};
const PATH_ORDER = ["eligibility", "process", "study", "simulation"];

// ─── GLOBAL STYLE ────────────────────────────────────────────────────────────

function GlobalStyle() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; }
.mc-root { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: ${T.text}; background: ${T.paper}; -webkit-font-smoothing: antialiased; }
.mc-root h1, .mc-root h2, .mc-root h3, .mc-display { font-family: 'Archivo', 'Inter', sans-serif; letter-spacing: -0.035em; line-height: 0.98; margin: 0; }
.mc-root p { margin: 0; }
.mc-root button { font-family: inherit; color: inherit; cursor: pointer; border: none; background: none; }
.mc-root button:focus-visible, .mc-root a:focus-visible, .mc-root input:focus-visible, .mc-root select:focus-visible {
  outline: 2px solid ${T.gold}; outline-offset: 3px; border-radius: 2px;
}

/* eyebrow */
.mc-eyebrow { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.18em; }
.mc-num { font-family: 'Archivo', sans-serif; font-weight: 700; letter-spacing: 0.02em; font-variant-numeric: tabular-nums; }

/* reveal */
.mc-rv { opacity: 0; transform: translateY(22px); transition: opacity .75s cubic-bezier(.2,.7,.3,1), transform .75s cubic-bezier(.2,.7,.3,1); }
.mc-rv.in { opacity: 1; transform: none; }

/* hero stagger */
@keyframes mcRise { from { opacity:0; transform: translateY(26px); } to { opacity:1; transform:none; } }
.mc-stag > * { opacity: 0; animation: mcRise .85s cubic-bezier(.2,.7,.3,1) forwards; }
.mc-stag > *:nth-child(1) { animation-delay: .05s }
.mc-stag > *:nth-child(2) { animation-delay: .14s }
.mc-stag > *:nth-child(3) { animation-delay: .23s }
.mc-stag > *:nth-child(4) { animation-delay: .32s }
.mc-stag > *:nth-child(5) { animation-delay: .41s }

/* chapter wipe */
@keyframes mcWipeIn  { from { transform: translateY(101%);} to { transform: translateY(0);} }
@keyframes mcWipeOut { from { transform: translateY(0);} to { transform: translateY(-101%);} }
@keyframes mcLabel   { 0%{opacity:0; transform:translateY(14px)} 22%{opacity:1; transform:none} 78%{opacity:1; transform:none} 100%{opacity:0; transform:translateY(-8px)} }
.mc-wipe { position: fixed; inset: 0; z-index: 300; display:flex; align-items:center; justify-content:center; will-change: transform; }
.mc-wipe.in  { animation: mcWipeIn  .58s cubic-bezier(.76,0,.24,1) forwards; }
.mc-wipe.out { animation: mcWipeOut .58s cubic-bezier(.76,0,.24,1) forwards; }
.mc-wipe-label { animation: mcLabel 1.16s ease forwards; text-align:center; }

/* ambient drift for hero field */
@keyframes mcDrift { from { transform: translate3d(0,0,0);} to { transform: translate3d(-40px,-18px,0);} }
.mc-drift { animation: mcDrift 34s linear infinite alternate; }
@keyframes mcTwinkle { 0%,100%{opacity:.20} 50%{opacity:.65} }

/* card hover */
.mc-chapter { transition: transform .32s cubic-bezier(.2,.7,.3,1), box-shadow .32s ease, border-color .32s ease; }
.mc-chapter:hover { transform: translateY(-6px); }
.mc-chapter:hover .mc-chapter-arrow { transform: translateX(6px); }
.mc-chapter-arrow { transition: transform .32s cubic-bezier(.2,.7,.3,1); }
.mc-chapter:hover .mc-emblem-stroke { opacity: 1; }
.mc-emblem-stroke { transition: opacity .4s ease; }

.mc-row { transition: background .2s ease, border-color .2s ease; }
.mc-btn { transition: transform .18s ease, background .2s ease, box-shadow .2s ease, opacity .2s ease; }
.mc-btn:hover:not(:disabled) { transform: translateY(-2px); }
.mc-btn:active:not(:disabled) { transform: translateY(0); }
.mc-link { transition: color .2s ease, gap .2s ease; }

/* layout helpers */
.mc-wrap { max-width: 1240px; margin: 0 auto; padding-left: 32px; padding-right: 32px; }
.mc-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; }
.mc-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.mc-hero-pad { padding: 168px 0 96px; }
.mc-only-desktop { display: block; }
.mc-only-mobile { display: none; }
.mc-nav-links { display: flex; gap: 4px; align-items: center; }

@media (max-width: 1024px) {
  .mc-grid-4 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .mc-wrap { padding-left: 20px; padding-right: 20px; }
  .mc-grid-4 { grid-template-columns: 1fr; }
  .mc-grid-2 { grid-template-columns: 1fr; gap: 16px; }
  .mc-hero-pad { padding: 120px 0 64px; }
  .mc-only-desktop { display: none !important; }
  .mc-only-mobile { display: block !important; }
  .mc-nav-links { display: none !important; }
}

@media (prefers-reduced-motion: reduce) {
  .mc-root *, .mc-root *::before, .mc-root *::after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; scroll-behavior: auto !important;
  }
  .mc-rv { opacity: 1; transform: none; }
  .mc-stag > * { opacity: 1; }
}
`}</style>
  );
}

// ─── REVEAL HOOK ─────────────────────────────────────────────────────────────

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    el.querySelectorAll(".mc-rv").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

// ─── EMBLEMS ─────────────────────────────────────────────────────────────────
// Line art built from the real artifacts of the naturalization process.

function EmblemEligibility({ size = 120, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path d="M60 8 L104 24 v38c0 27-19 43-44 50-25-7-44-23-44-50V24Z" stroke={color} strokeWidth="1.6" opacity=".38" />
      {[36, 48, 60, 72].map((y, i) => (
        <line key={y} x1={22 + i * 2} y1={y} x2={98 - i * 2} y2={y} stroke={color} strokeWidth="1.4" opacity={0.16 + i * 0.1} />
      ))}
      <path className="mc-emblem-stroke" d="M40 62 L54 76 L82 44" stroke={color} strokeWidth="3" strokeLinecap="square" opacity=".55" />
    </svg>
  );
}

function EmblemProcess({ size = 120, color = "#fff" }) {
  const steps = Array.from({ length: 10 });
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      {steps.map((_, i) => {
        const y = 100 - i * 8.4;
        const x = 16 + i * 5.6;
        const w = 30;
        return (
          <g key={i} opacity={0.2 + i * 0.075}>
            <line x1={x} y1={y} x2={x + w} y2={y} stroke={color} strokeWidth="1.8" strokeLinecap="square" />
            <line x1={x + w} y1={y} x2={x + w} y2={y - 8.4} stroke={color} strokeWidth="1.1" opacity=".5" />
          </g>
        );
      })}
      <g className="mc-emblem-stroke" opacity=".6">
        <line x1="72" y1="24" x2="72" y2="6" stroke={color} strokeWidth="1.8" />
        <path d="M72 7 h20 l-5 6 5 6 H72 Z" stroke={color} strokeWidth="1.6" fill="none" />
      </g>
    </svg>
  );
}

function EmblemStudy({ size = 120, color = "#fff" }) {
  // 128 marks — 16 x 8. Twenty are asked (outlined). Twelve must be right (filled).
  const cols = 16, rows = 8;
  const asked = new Set([3, 9, 17, 22, 28, 34, 41, 47, 53, 60, 66, 72, 79, 85, 91, 98, 104, 110, 117, 123]);
  const correct = new Set([9, 22, 34, 47, 60, 72, 85, 91, 104, 110, 117, 123]);
  const marks = [];
  for (let i = 0; i < 128; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    const x = 10 + c * 6.6, y = 26 + r * 8.6;
    if (correct.has(i)) marks.push(<rect key={i} x={x - 1.6} y={y - 1.6} width="3.6" height="3.6" fill={color} opacity=".92" />);
    else if (asked.has(i)) marks.push(<rect key={i} x={x - 2.1} y={y - 2.1} width="4.6" height="4.6" stroke={color} strokeWidth="1.1" fill="none" opacity=".75" />);
    else marks.push(<rect key={i} x={x - 0.7} y={y - 0.7} width="1.6" height="1.6" fill={color} opacity=".22" />);
  }
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <g className="mc-emblem-stroke" opacity=".85">{marks}</g>
      <line x1="10" y1="16" x2="110" y2="16" stroke={color} strokeWidth="1" opacity=".3" />
      <line x1="10" y1="104" x2="110" y2="104" stroke={color} strokeWidth="1" opacity=".3" />
    </svg>
  );
}

function EmblemSimulation({ size = 120, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path d="M14 34 h44 v30 h-30 l-14 12 Z" stroke={color} strokeWidth="1.6" opacity=".5" fill="none" />
      <path d="M106 56 h-44 v30 h30 l14 12 Z" stroke={color} strokeWidth="1.6" opacity=".28" fill="none" />
      <g className="mc-emblem-stroke" opacity=".6">
        {[26, 34, 42].map((x) => <circle key={x} cx={x} cy="49" r="2.2" fill={color} />)}
      </g>
      {[74, 82, 90].map((x, i) => <circle key={x} cx={x} cy="71" r="1.8" fill={color} opacity={0.5 - i * 0.12} />)}
    </svg>
  );
}

const EMBLEMS = { eligibility: EmblemEligibility, process: EmblemProcess, study: EmblemStudy, simulation: EmblemSimulation };

// The flag, deconstructed as data: 50 stars dissolving into 13 stripes.
function HeroField() {
  const stars = [];
  for (let r = 0; r < 9; r++) {
    const n = r % 2 === 0 ? 6 : 5;
    for (let c = 0; c < n; c++) {
      const x = 40 + c * 58 + (r % 2 ? 29 : 0);
      const y = 60 + r * 42;
      stars.push(
        <circle key={`${r}-${c}`} cx={x} cy={y} r={r % 3 === 0 ? 1.9 : 1.3} fill="#fff"
          style={{ opacity: 0.28, animation: `mcTwinkle ${5 + ((r * 7 + c * 3) % 9)}s ease-in-out ${(r + c) % 6}s infinite` }} />
      );
    }
  }
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="mcStripe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2F6FE4" stopOpacity="0" />
          <stop offset="42%" stopColor="#2F6FE4" stopOpacity=".55" />
          <stop offset="100%" stopColor="#C8A24A" stopOpacity=".28" />
        </linearGradient>
        <radialGradient id="mcGlow" cx="26%" cy="34%" r="62%">
          <stop offset="0%" stopColor="#2F6FE4" stopOpacity=".30" />
          <stop offset="100%" stopColor="#0B1220" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="900" fill={T.ink} />
      <rect width="1440" height="900" fill="url(#mcGlow)" />
      <g className="mc-drift">{stars}</g>
      <g>
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={i} x1={430 + i * 12} y1={900} x2={880 + i * 40} y2={-40}
            stroke="url(#mcStripe)" strokeWidth={i % 2 === 0 ? 22 : 9} opacity={i % 2 === 0 ? 0.5 : 0.24} />
        ))}
      </g>
      <rect width="1440" height="900" fill={T.ink} opacity=".34" />
    </svg>
  );
}

// ─── SHARED PRIMITIVES ───────────────────────────────────────────────────────

function Eyebrow({ children, color = T.gold, style }) {
  return (
    <div className="mc-eyebrow" style={{ color, display: "flex", alignItems: "center", gap: 10, ...style }}>
      <span style={{ width: 22, height: 1, background: color, opacity: .8 }} />
      {children}
    </div>
  );
}

function Rule({ color = T.line, style }) {
  return <div style={{ height: 1, background: color, ...style }} />;
}

function PrimaryButton({ children, onClick, bg = T.ink, fg = "#fff", disabled, style, icon: Ico }) {
  return (
    <button className="mc-btn" onClick={onClick} disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
        padding: "16px 28px", background: disabled ? "#C7CDD6" : bg, color: disabled ? "#8A94A6" : fg,
        fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em",
        cursor: disabled ? "not-allowed" : "pointer", ...style,
      }}>
      {children}{Ico && <Ico size={17} strokeWidth={2.2} />}
    </button>
  );
}

function GhostButton({ children, onClick, color = T.ink, style, icon: Ico, iconLeft }) {
  return (
    <button className="mc-btn" onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
        padding: "15px 26px", background: "transparent", color, border: `1px solid ${color}`,
        fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", ...style,
      }}>
      {iconLeft && <iconLeft.type size={17} strokeWidth={2.2} />}
      {children}{Ico && <Ico size={17} strokeWidth={2.2} />}
    </button>
  );
}

function BackLink({ onNav, color = T.muted }) {
  return (
    <button className="mc-link" onClick={() => onNav("home")}
      style={{ display: "inline-flex", alignItems: "center", gap: 8, color, fontSize: 13, fontWeight: 600, padding: 0, letterSpacing: "-0.01em" }}>
      <ArrowLeft size={15} strokeWidth={2.4} /> Volver al inicio
    </button>
  );
}

// ─── PATH HERO BAND ──────────────────────────────────────────────────────────

function PathHero({ path, onNav, children }) {
  const p = PATHS[path];
  const Emblem = EMBLEMS[path];
  return (
    <header style={{ background: T.ink, color: "#fff", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(120% 130% at 88% 12%, ${p.accent}42 0%, transparent 58%)`,
      }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: p.accent }} />
      <div className="mc-wrap" style={{ position: "relative", padding: "104px 32px 52px" }}>
        <div style={{ marginBottom: 26 }}><BackLink onNav={onNav} color="rgba(255,255,255,.62)" /></div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32 }}>
          <div className="mc-stag" style={{ maxWidth: 720 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 14 }}>
              <span className="mc-num" style={{ fontSize: 13, color: p.accent, letterSpacing: ".16em" }}>{p.n}</span>
              <span className="mc-eyebrow" style={{ color: "rgba(255,255,255,.5)" }}>{p.titleEn}</span>
            </div>
            <h1 style={{ fontSize: "clamp(38px,6.4vw,74px)", fontWeight: 800 }}>{p.title}</h1>
            <p style={{ marginTop: 18, fontSize: "clamp(15px,2vw,19px)", color: "rgba(255,255,255,.66)", maxWidth: 560, lineHeight: 1.5 }}>{p.lede}</p>
            {children}
          </div>
          <div className="mc-only-desktop" style={{ opacity: .9, flexShrink: 0 }}>
            <Emblem size={168} color="#fff" />
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── CHAPTER WIPE ────────────────────────────────────────────────────────────

function ChapterWipe({ path, phase }) {
  const p = PATHS[path];
  if (!p) return null;
  const Emblem = EMBLEMS[path];
  return (
    <div className={`mc-wipe ${phase}`} style={{ background: p.accentDeep }} aria-hidden="true">
      <div className="mc-wipe-label" style={{ color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22, opacity: .5 }}>
          <Emblem size={92} color="#fff" />
        </div>
        <div className="mc-num" style={{ fontSize: 12, letterSpacing: ".3em", opacity: .7, marginBottom: 12 }}>CAPÍTULO {p.n}</div>
        <div className="mc-display" style={{ fontSize: "clamp(40px,8vw,86px)", fontWeight: 800 }}>{p.title}</div>
      </div>
    </div>
  );
}

// ─── DISCLAIMER GATE ─────────────────────────────────────────────────────────

const LEGAL = {
  es: {
    kicker: "Antes de comenzar",
    title: "Aviso legal",
    lede: "Esta herramienta le acompaña. No le representa.",
    accept: "He leído y acepto el aviso legal",
    acceptLong: "Entiendo que esta aplicación es una herramienta informativa y educativa gratuita, que no constituye asesoría legal, que no establece relación abogado-cliente, que su creador no es abogado ni consultor de inmigración autorizado, y que debo consultar con un abogado de inmigración con licencia o un representante acreditado por el DOJ (8 CFR § 292.1) antes de tomar decisiones sobre mi proceso migratorio.",
    cta: "Aceptar y entrar",
    foot: "Fuente oficial: uscis.gov · Reporte fraude: uscis.gov/avoid-scams · USCIS: 1-800-375-5283",
    items: [
      ["No constituye asesoría legal", "Mi Ciudadanía es una herramienta educativa e informativa gratuita creada con fines orientativos. El contenido no constituye asesoría legal, representación legal, ni consejo jurídico de ningún tipo. Esta herramienta no analiza los hechos individuales de su caso ni aplica la ley a sus circunstancias específicas."],
      ["No se establece relación abogado-cliente", "El uso de esta aplicación no crea una relación abogado-cliente. Gustavo Valbuena / PeopleBot AI no es un bufete de abogados, no es abogado, no ejerce la abogacía, y no está autorizado para proveer representación ni asesoría jurídica."],
      ["No es notario, consultor, ni representante acreditado", "El creador no es \"notario público\", consultor de inmigración, ni representante acreditado por el DOJ. Conforme a 8 CFR § 1.2 y 8 CFR § 292.1, solo abogados con licencia y representantes acreditados por el DOJ pueden ejercer la ley de inmigración en Estados Unidos."],
      ["No prepara ni presenta formularios", "Esta herramienta no prepara, completa, revisa, ni presenta formularios ante USCIS, el DHS, ni ninguna agencia gubernamental en su nombre. No selecciona formularios por usted ni actúa en su representación."],
      ["Consulte con un profesional autorizado", "Las leyes de inmigración son complejas y cambian con frecuencia. Antes de tomar decisiones, consulte con un abogado de inmigración con licencia en su jurisdicción o un representante acreditado por el DOJ conforme a 8 CFR § 292.1."],
      ["Alcance de la verificación de elegibilidad", "La sección de elegibilidad presenta criterios generales publicados en uscis.gov. No es un análisis individualizado ni una determinación oficial. Solo USCIS puede determinar su elegibilidad."],
      ["La información puede no estar actualizada", "Las respuestas a ciertas preguntas cambian por elecciones o nombramientos. Verifique siempre en uscis.gov y uscis.gov/citizenship/testupdates."],
      ["Sin garantía de resultados", "El uso de esta aplicación no garantiza la aprobación de su solicitud ni el éxito en el examen. Los resultados de las simulaciones son indicativos y se ofrecen \"tal cual\", sin garantía de exactitud o vigencia."],
      ["Limitación de responsabilidad", "En la máxima medida permitida por la ley, el creador, sus colaboradores y PeopleBot AI no serán responsables por daños directos, indirectos, incidentales, consecuentes, especiales o punitivos derivados del uso de esta aplicación, incluyendo decisiones tomadas con esta información, pérdidas económicas, retrasos, o denegación de solicitudes."],
      ["Fuentes y uso gratuito", "Esta aplicación es gratuita y sin fines de lucro. Todo el contenido proviene de materiales públicos de uscis.gov, incluyendo las 128 preguntas del examen cívico 2025 (M-1778, 09/25). Usted puede acceder a estos materiales y presentar solicitudes directamente en uscis.gov sin intermediarios."],
      ["Protección contra fraude migratorio", "Desconfíe de quien prometa resultados garantizados. Solo un abogado con licencia o representante acreditado por el DOJ puede darle asesoría legal (8 CFR § 292.1). Reporte fraude en uscis.gov/avoid-scams o al 1-800-375-5283."],
      ["Ley aplicable", "Este aviso se rige por las leyes federales de Estados Unidos, incluyendo la INA y el 8 CFR, y las leyes estatales aplicables. En caso de conflicto, prevalecerá la ley aplicable."],
      ["Privacidad", "Esta aplicación no recopila, almacena, ni transmite información personal identificable. Ningún dato sale de su dispositivo. No requiere registro."],
    ],
  },
  en: {
    kicker: "Before you begin",
    title: "Legal notice",
    lede: "This tool walks with you. It does not represent you.",
    accept: "I have read and accept this legal notice",
    acceptLong: "I understand this application is a free informational and educational tool, that it does not constitute legal advice, that it does not establish an attorney-client relationship, that its creator is not an attorney or authorized immigration consultant, and that I should consult a licensed immigration attorney or DOJ-accredited representative (8 CFR § 292.1) before making decisions about my immigration process.",
    cta: "Accept and enter",
    foot: "Official source: uscis.gov · Report fraud: uscis.gov/avoid-scams · USCIS: 1-800-375-5283",
    items: [
      ["Not legal advice", "Mi Ciudadanía is a free educational and informational tool created for guidance purposes. The content does not constitute legal advice, legal representation, or legal counsel of any kind. This tool does not analyze the individual facts of your case or apply the law to your specific circumstances."],
      ["No attorney-client relationship", "Use of this application does not create an attorney-client relationship. Gustavo Valbuena / PeopleBot AI is not a law firm, is not an attorney, does not practice law, and is not authorized to provide legal representation or advice."],
      ["Not a notario, consultant, or accredited representative", "The creator is not a \"notario público\", immigration consultant, or DOJ-accredited representative. Under 8 CFR § 1.2 and 8 CFR § 292.1, only licensed attorneys and DOJ-accredited representatives may practice immigration law in the United States."],
      ["Does not prepare or file forms", "This tool does not prepare, complete, review, or file forms with USCIS, DHS, or any government agency on your behalf. It does not select forms for you or act as your representative."],
      ["Consult a licensed professional", "Immigration laws are complex and change frequently. Before making decisions, consult a licensed immigration attorney in your jurisdiction or a DOJ-accredited representative under 8 CFR § 292.1."],
      ["Scope of the eligibility check", "The eligibility section presents general criteria published on uscis.gov. It is not an individualized analysis or an official determination. Only USCIS can determine your eligibility."],
      ["Information may not be current", "Answers to certain questions change with elections and appointments. Always verify at uscis.gov and uscis.gov/citizenship/testupdates."],
      ["No guarantee of results", "Use of this application does not guarantee approval of your application or success on the test. Simulation results are indicative and provided \"as is\", without warranty of accuracy or currency."],
      ["Limitation of liability", "To the maximum extent permitted by law, the creator, its contributors, and PeopleBot AI shall not be liable for direct, indirect, incidental, consequential, special, or punitive damages arising from use of this application, including decisions made with this information, financial losses, delays, or denial of applications."],
      ["Sources and free use", "This application is free and non-commercial. All content comes from public materials at uscis.gov, including the 128 questions of the 2025 civics test (M-1778, 09/25). You may access these materials and file directly at uscis.gov without any intermediary."],
      ["Protection against immigration fraud", "Be wary of anyone promising guaranteed results. Only a licensed attorney or DOJ-accredited representative can give you legal advice (8 CFR § 292.1). Report fraud at uscis.gov/avoid-scams or 1-800-375-5283."],
      ["Governing law", "This notice is governed by the federal laws of the United States, including the INA and 8 CFR, and applicable state law. In case of conflict, applicable law prevails."],
      ["Privacy", "This application does not collect, store, or transmit personally identifiable information. No data leaves your device. No registration required."],
    ],
  },
};

function DisclaimerGate({ onAccept }) {
  const [checked, setChecked] = useState(false);
  const [lang, setLang] = useState("es");
  const L = LEGAL[lang];

  return (
    <div className="mc-root" style={{ minHeight: "100vh", background: T.ink, color: "#fff" }}>
      <GlobalStyle />
      <div className="mc-wrap" style={{ paddingTop: 56, paddingBottom: 72, maxWidth: 980 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <Scale size={19} color={T.gold} strokeWidth={2} />
            <span className="mc-display" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>Mi Ciudadanía</span>
          </div>
          <div style={{ display: "flex", border: "1px solid rgba(255,255,255,.18)" }}>
            {["es", "en"].map((l) => (
              <button key={l} onClick={() => setLang(l)}
                style={{
                  padding: "7px 16px", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase",
                  background: lang === l ? "#fff" : "transparent", color: lang === l ? T.ink : "rgba(255,255,255,.6)",
                }}>{l}</button>
            ))}
          </div>
        </div>

        <div className="mc-stag" style={{ marginBottom: 48 }}>
          <Eyebrow color={T.gold}>{L.kicker}</Eyebrow>
          <h1 style={{ fontSize: "clamp(40px,7vw,76px)", fontWeight: 800, marginTop: 20 }}>{L.title}</h1>
          <p style={{ marginTop: 20, fontSize: "clamp(17px,2.4vw,23px)", color: "rgba(255,255,255,.6)", lineHeight: 1.4, maxWidth: 520 }}>{L.lede}</p>
        </div>

        <Rule color="rgba(255,255,255,.14)" style={{ marginBottom: 4 }} />

        <div style={{ maxHeight: 380, overflowY: "auto", paddingRight: 4 }}>
          {L.items.map(([h, body], i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 16, padding: "22px 0", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
              <span className="mc-num" style={{ fontSize: 12, color: T.gold, opacity: .8, paddingTop: 3 }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 7, letterSpacing: "-0.01em" }}>{h}</div>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,.58)" }}>{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40 }}>
          <button onClick={() => setChecked(!checked)} aria-pressed={checked}
            style={{ display: "flex", alignItems: "flex-start", gap: 14, textAlign: "left", width: "100%", padding: 0, marginBottom: 26 }}>
            <span style={{
              width: 22, height: 22, flexShrink: 0, marginTop: 2,
              border: checked ? "none" : "1.5px solid rgba(255,255,255,.4)",
              background: checked ? T.gold : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s ease",
            }}>{checked && <Check size={14} color={T.ink} strokeWidth={3.2} />}</span>
            <span>
              <span style={{ display: "block", fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{L.accept}</span>
              <span style={{ display: "block", fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,.5)" }}>{L.acceptLong}</span>
            </span>
          </button>

          <PrimaryButton onClick={onAccept} disabled={!checked} bg="#fff" fg={T.ink} icon={ArrowRight}
            style={{ width: "100%", padding: "19px 28px", fontSize: 16 }}>
            {L.cta}
          </PrimaryButton>

          <p style={{ marginTop: 22, fontSize: 12, color: "rgba(255,255,255,.38)", textAlign: "center", lineHeight: 1.6 }}>{L.foot}</p>
        </div>
      </div>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────

function Nav({ view, onNav, dark }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const h = () => setSolid(window.scrollY > 24);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const onDark = dark || !solid;
  const fg = onDark ? "#fff" : T.ink;

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      background: solid ? (dark ? "rgba(11,18,32,.92)" : "rgba(255,255,255,.94)") : "transparent",
      backdropFilter: solid ? "saturate(180%) blur(16px)" : "none",
      WebkitBackdropFilter: solid ? "saturate(180%) blur(16px)" : "none",
      borderBottom: solid ? `1px solid ${dark ? "rgba(255,255,255,.1)" : T.line}` : "1px solid transparent",
      transition: "background .3s ease, border-color .3s ease",
    }}>
      <div className="mc-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        <button onClick={() => onNav("home")} style={{ display: "flex", alignItems: "center", gap: 10, padding: 0 }}>
          <Scale size={18} color={onDark ? T.gold : T.ink} strokeWidth={2.2} />
          <span className="mc-display" style={{ fontSize: 16, fontWeight: 700, color: fg, letterSpacing: "-0.025em" }}>Mi Ciudadanía</span>
        </button>

        <div className="mc-nav-links">
          {PATH_ORDER.map((k) => {
            const p = PATHS[k], active = view === k;
            return (
              <button key={k} onClick={() => onNav(k)} className="mc-link"
                style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "8px 15px",
                  fontSize: 13, fontWeight: active ? 600 : 500, color: active ? fg : (onDark ? "rgba(255,255,255,.62)" : T.muted),
                  borderBottom: `2px solid ${active ? p.accent : "transparent"}`,
                }}>
                <span className="mc-num" style={{ fontSize: 10, opacity: .55 }}>{p.n}</span>{p.title}
              </button>
            );
          })}
        </div>

        <button className="mc-only-mobile" onClick={() => setOpen(!open)} style={{ padding: 8, color: fg }} aria-label="Menú">
          {open ? <X size={21} color={fg} /> : <Menu size={21} color={fg} />}
        </button>
      </div>

      {open && (
        <div className="mc-only-mobile" style={{ background: dark ? T.ink2 : "#fff", borderTop: `1px solid ${dark ? "rgba(255,255,255,.1)" : T.line}` }}>
          <div className="mc-wrap" style={{ paddingTop: 8, paddingBottom: 16 }}>
            {PATH_ORDER.map((k) => {
              const p = PATHS[k];
              return (
                <button key={k} onClick={() => { onNav(k); setOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "16px 0", borderBottom: `1px solid ${dark ? "rgba(255,255,255,.07)" : T.line}` }}>
                  <span className="mc-num" style={{ fontSize: 11, color: p.accent }}>{p.n}</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: fg }}>{p.title}</span>
                  <ChevronRight size={16} color={onDark ? "rgba(255,255,255,.4)" : T.faint} style={{ marginLeft: "auto" }} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── LANDING ─────────────────────────────────────────────────────────────────

function Landing({ onNav }) {
  const ref = useReveal();
  return (
    <div ref={ref}>
      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", background: T.ink, color: "#fff", overflow: "hidden" }}>
        <HeroField />
        <div className="mc-wrap mc-hero-pad" style={{ position: "relative", width: "100%" }}>
          <div className="mc-stag" style={{ maxWidth: 880 }}>
            <Eyebrow color={T.gold}>Examen cívico 2025 · 128 preguntas</Eyebrow>
            <h1 style={{ fontSize: "clamp(44px,8.6vw,116px)", fontWeight: 800, marginTop: 26 }}>
              Su camino a la<br />ciudadanía, en claro.
            </h1>
            <p style={{ marginTop: 30, fontSize: "clamp(17px,2.3vw,22px)", lineHeight: 1.5, color: "rgba(255,255,255,.68)", maxWidth: 620 }}>
              Cuatro caminos, en español y en inglés, construidos únicamente con fuentes oficiales de USCIS. Empiece por donde esté.
            </p>
            <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: 12 }}>
              <PrimaryButton onClick={() => onNav("eligibility")} bg="#fff" fg={T.ink} icon={ArrowRight}>Verificar mi elegibilidad</PrimaryButton>
              <GhostButton onClick={() => onNav("study")} color="rgba(255,255,255,.55)">Ir al estudio</GhostButton>
            </div>
          </div>
        </div>
        <div className="mc-only-desktop" style={{ position: "absolute", bottom: 34, left: 0, right: 0 }}>
          <div className="mc-wrap" style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,.42)" }}>
            <ChevronDown size={15} />
            <span style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 600 }}>Los cuatro caminos</span>
          </div>
        </div>
      </section>

      {/* CHAPTERS */}
      <section style={{ background: T.ink2, color: "#fff" }}>
        <div className="mc-wrap" style={{ paddingTop: 92, paddingBottom: 40 }}>
          <div className="mc-rv">
            <Eyebrow color={T.gold}>Cómo funciona</Eyebrow>
            <h2 style={{ fontSize: "clamp(30px,4.6vw,54px)", fontWeight: 700, marginTop: 20, maxWidth: 760 }}>
              Cuatro caminos. Tome el que necesita hoy.
            </h2>
          </div>
        </div>
        <div className="mc-wrap" style={{ paddingBottom: 96 }}>
          <div className="mc-grid-4" style={{ background: "rgba(255,255,255,.1)" }}>
            {PATH_ORDER.map((k, i) => {
              const p = PATHS[k], Emblem = EMBLEMS[k];
              return (
                <button key={k} onClick={() => onNav(k)} className="mc-chapter mc-rv"
                  style={{
                    background: T.ink2, padding: "34px 28px 30px", textAlign: "left",
                    display: "flex", flexDirection: "column", minHeight: 340, transitionDelay: `${i * 70}ms`,
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 }}>
                    <span className="mc-num" style={{ fontSize: 12, letterSpacing: ".22em", color: p.accent }}>{p.n}</span>
                    <div style={{ opacity: .58 }}><Emblem size={76} color="#fff" /></div>
                  </div>
                  <h3 style={{ fontSize: 27, fontWeight: 700, marginBottom: 12, color: "#fff" }}>{p.title}</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "rgba(255,255,255,.56)", flex: 1 }}>{p.lede}</p>
                  <div className="mc-chapter-arrow" style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 26, color: p.accent, fontSize: 13, fontWeight: 600 }}>
                    Entrar <ArrowRight size={15} strokeWidth={2.4} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* THE NUMBERS */}
      <section style={{ background: T.paper }}>
        <div className="mc-wrap" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <div className="mc-rv" style={{ marginBottom: 52 }}>
            <Eyebrow color={T.muted}>El examen, en números</Eyebrow>
            <h2 style={{ fontSize: "clamp(28px,4.2vw,48px)", fontWeight: 700, marginTop: 20, maxWidth: 680 }}>
              Estudia 128. Le preguntan 20. Necesita 12.
            </h2>
          </div>
          <div className="mc-rv" style={{ borderTop: `1px solid ${T.line}` }}>
            {[
              ["128", "preguntas publicadas", "Versión 2025 del examen cívico (M-1778)"],
              ["20", "preguntas en la entrevista", "El oficial las hace oralmente, en inglés"],
              ["12", "respuestas correctas para aprobar", "Se detiene al llegar a 12 aciertos"],
              ["20", "preguntas marcadas 65/20", "Si tiene 65+ años y 20+ como residente"],
            ].map(([n, label, note], i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "minmax(96px,140px) 1fr", gap: 24,
                alignItems: "baseline", padding: "26px 0", borderBottom: `1px solid ${T.line}`,
              }}>
                <span className="mc-num" style={{ fontSize: "clamp(40px,6vw,66px)", color: T.ink, lineHeight: 1 }}>{n}</span>
                <div>
                  <div style={{ fontSize: "clamp(15px,2vw,19px)", fontWeight: 600, letterSpacing: "-0.01em" }}>{label}</div>
                  <div style={{ fontSize: 14, color: T.muted, marginTop: 5 }}>{note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOURCES */}
      <section style={{ background: T.card, borderTop: `1px solid ${T.line}` }}>
        <div className="mc-wrap" style={{ paddingTop: 88, paddingBottom: 88 }}>
          <div className="mc-grid-2" style={{ gap: 56, alignItems: "start" }}>
            <div className="mc-rv">
              <Eyebrow color={T.muted}>De dónde viene todo</Eyebrow>
              <h2 style={{ fontSize: "clamp(26px,3.6vw,42px)", fontWeight: 700, marginTop: 20 }}>
                Solo fuentes oficiales.<br />Nada inventado.
              </h2>
              <p style={{ marginTop: 20, fontSize: 16, lineHeight: 1.65, color: T.muted, maxWidth: 460 }}>
                Cada pregunta, requisito y paso viene de documentos publicados por USCIS. Las respuestas que cambian con elecciones o nombramientos se marcan como tal y le enviamos a la fuente.
              </p>
            </div>
            <div className="mc-rv" style={{ borderTop: `1px solid ${T.line}` }}>
              {[
                [FileText, "M-1778 (09/25)", "128 Civics Questions and Answers, versión 2025"],
                [ClipboardList, "Formulario N-400", "Application for Naturalization · $760"],
                [Shield, "8 CFR § 292.1", "Quién puede representarle ante USCIS"],
                [Info, "uscis.gov/citizenship/testupdates", "Respuestas que cambian con elecciones"],
              ].map(([Ico, t, d], i) => (
                <div key={i} style={{ display: "flex", gap: 16, padding: "20px 0", borderBottom: `1px solid ${T.line}` }}>
                  <Ico size={18} color={T.faint} strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: "-0.01em" }}>{t}</div>
                    <div style={{ fontSize: 13.5, color: T.muted, marginTop: 4 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section style={{ background: T.ink, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 120% at 78% 20%, ${T.gold}22 0%, transparent 60%)` }} />
        <div className="mc-wrap" style={{ position: "relative", paddingTop: 104, paddingBottom: 104 }}>
          <div className="mc-rv" style={{ maxWidth: 640 }}>
            <Eyebrow color={T.gold}>Empiece</Eyebrow>
            <h2 style={{ fontSize: "clamp(32px,5.4vw,62px)", fontWeight: 800, marginTop: 22 }}>
              Diez preguntas.<br />Cuatro minutos.
            </h2>
            <p style={{ marginTop: 20, fontSize: 17, lineHeight: 1.6, color: "rgba(255,255,255,.62)" }}>
              La verificación de elegibilidad le dice si califica hoy, o exactamente qué le falta y cuándo podrá aplicar.
            </p>
            <div style={{ marginTop: 34 }}>
              <PrimaryButton onClick={() => onNav("eligibility")} bg={PATHS.eligibility.accent} fg="#fff" icon={ArrowRight}>
                Comenzar la verificación
              </PrimaryButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── 01 · ELIGIBILITY ────────────────────────────────────────────────────────

function EligibilityView({ onNav }) {
  const A = PATHS.eligibility;
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const q = ELIGIBILITY_QUESTIONS[step];
  const total = ELIGIBILITY_QUESTIONS.length;

  const answer = (yes) => {
    if (!yes) setResult("no");
    else if (step + 1 >= total) setResult("yes");
    else setStep(step + 1);
  };
  const restart = () => { setStep(0); setResult(null); };

  if (result) {
    const ok = result === "yes";
    return (
      <div style={{ background: T.paper, minHeight: "100vh" }}>
        <PathHero path="eligibility" onNav={onNav} />
        <div className="mc-wrap" style={{ paddingTop: 64, paddingBottom: 96, maxWidth: 860 }}>
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderTop: `3px solid ${ok ? A.accent : T.gold}` }}>
            <div style={{ padding: "44px 44px 36px" }}>
              <Eyebrow color={ok ? A.accent : T.gold}>{ok ? "Resultado" : "Aún no"}</Eyebrow>
              <h2 style={{ fontSize: "clamp(28px,4.4vw,46px)", fontWeight: 700, marginTop: 18, maxWidth: 560 }}>
                {ok ? "Parece que usted es elegible." : "Le falta cumplir este requisito."}
              </h2>
              {ok ? (
                <p style={{ marginTop: 20, fontSize: 17, lineHeight: 1.65, color: T.muted, maxWidth: 560 }}>
                  Según sus respuestas, cumple los requisitos básicos para solicitar la naturalización. El siguiente paso es reunir documentos y llenar el formulario N-400.
                </p>
              ) : (
                <div style={{ marginTop: 26, paddingLeft: 20, borderLeft: `2px solid ${T.gold}` }}>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, letterSpacing: "-0.01em" }}>{q.text}</div>
                  <p style={{ fontSize: 15.5, lineHeight: 1.7, color: T.muted }}>{q.disqualifyMsg}</p>
                </div>
              )}
              <p style={{ marginTop: 26, fontSize: 13.5, lineHeight: 1.65, color: T.faint, maxWidth: 560 }}>
                Esta evaluación es informativa y no constituye una determinación oficial. Solo USCIS puede determinar su elegibilidad.
              </p>
            </div>
            <Rule />
            <div style={{ padding: "24px 44px", display: "flex", flexWrap: "wrap", gap: 10 }}>
              {ok && <PrimaryButton onClick={() => onNav("process")} bg={A.accent} icon={ArrowRight}>Ver el proceso paso a paso</PrimaryButton>}
              <GhostButton onClick={restart} color={T.muted}>Evaluar de nuevo</GhostButton>
              <GhostButton onClick={() => onNav("home")} color={T.muted}>Inicio</GhostButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: T.paper, minHeight: "100vh" }}>
      <PathHero path="eligibility" onNav={onNav} />
      <div className="mc-wrap" style={{ paddingTop: 56, paddingBottom: 96, maxWidth: 860 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <span className="mc-eyebrow" style={{ color: T.muted }}>Pregunta {step + 1} de {total}</span>
          <span className="mc-num" style={{ fontSize: 12, color: T.faint }}>{String(Math.round((step / total) * 100)).padStart(2, "0")}%</span>
        </div>
        <div style={{ height: 2, background: T.line, marginBottom: 44 }}>
          <div style={{ height: 2, background: A.accent, width: `${(step / total) * 100}%`, transition: "width .5s cubic-bezier(.2,.7,.3,1)" }} />
        </div>

        <div key={step} className="mc-stag" style={{ background: T.card, border: `1px solid ${T.line}`, padding: "44px 44px 36px" }}>
          <h2 style={{ fontSize: "clamp(24px,3.4vw,36px)", fontWeight: 700, lineHeight: 1.14, maxWidth: 620 }}>{q.text}</h2>
          <p style={{ marginTop: 18, fontSize: 15.5, lineHeight: 1.7, color: T.muted, maxWidth: 620 }}>{q.help}</p>
          <div style={{ marginTop: 36, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <PrimaryButton onClick={() => answer(true)} bg={A.accent} style={{ minWidth: 150 }} icon={Check}>Sí</PrimaryButton>
            <GhostButton onClick={() => answer(false)} color={T.ink} style={{ minWidth: 150 }}>No</GhostButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 02 · PROCESS ────────────────────────────────────────────────────────────

const STEP_ICONS = { shield: Shield, file: FileText, clipboard: ClipboardList, dollar: DollarSign, target: Target, book: BookOpen, message: MessageSquare, check: CheckCircle2, award: Award, flag: Flag };

function ChecklistView({ onNav }) {
  const A = PATHS.process;
  const [done, setDone] = useState([]);
  const [open, setOpen] = useState(1);
  const toggle = (id) => setDone((d) => d.includes(id) ? d.filter((x) => x !== id) : [...d, id]);
  const pct = Math.round((done.length / PROCESS_STEPS.length) * 100);

  return (
    <div style={{ background: T.paper, minHeight: "100vh" }}>
      <PathHero path="process" onNav={onNav}>
        <div style={{ marginTop: 34, maxWidth: 380 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
            <span className="mc-eyebrow" style={{ color: "rgba(255,255,255,.5)" }}>Su avance</span>
            <span className="mc-num" style={{ fontSize: 13, color: "#fff" }}>{done.length} / {PROCESS_STEPS.length}</span>
          </div>
          <div style={{ height: 2, background: "rgba(255,255,255,.2)" }}>
            <div style={{ height: 2, background: A.accent, width: `${pct}%`, transition: "width .6s cubic-bezier(.2,.7,.3,1)" }} />
          </div>
        </div>
      </PathHero>

      <div className="mc-wrap" style={{ paddingTop: 64, paddingBottom: 96, maxWidth: 940 }}>
        <div style={{ borderTop: `1px solid ${T.line}` }}>
          {PROCESS_STEPS.map((s) => {
            const isDone = done.includes(s.id);
            const isOpen = open === s.id;
            const Ico = STEP_ICONS[s.icon] || CircleDot;
            return (
              <div key={s.id} className="mc-row" style={{ borderBottom: `1px solid ${T.line}`, background: isOpen ? T.card : "transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 24px", cursor: "pointer" }}
                  onClick={() => setOpen(isOpen ? null : s.id)}>
                  <button onClick={(e) => { e.stopPropagation(); toggle(s.id); }}
                    aria-label={isDone ? "Marcar como pendiente" : "Marcar como completado"}
                    style={{
                      width: 26, height: 26, flexShrink: 0, border: isDone ? "none" : `1.5px solid ${T.faint}`,
                      background: isDone ? A.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s ease",
                    }}>{isDone && <Check size={15} color="#fff" strokeWidth={3.2} />}</button>

                  <span className="mc-num" style={{ fontSize: 12, color: isDone ? A.accent : T.faint, width: 26, flexShrink: 0 }}>
                    {String(s.id).padStart(2, "0")}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em",
                      color: isDone ? T.faint : T.ink, textDecoration: isDone ? "line-through" : "none",
                    }}>{s.title}</div>
                    {!isOpen && <div style={{ fontSize: 14, color: T.muted, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.desc}</div>}
                  </div>

                  <Ico size={17} color={isDone ? A.accent : T.faint} strokeWidth={1.9} className="mc-only-desktop" style={{ flexShrink: 0 }} />
                  {isOpen ? <ChevronUp size={17} color={T.faint} /> : <ChevronDown size={17} color={T.faint} />}
                </div>

                {isOpen && (
                  <div style={{ padding: "0 24px 30px 116px" }}>
                    <p style={{ fontSize: 16, lineHeight: 1.6, color: T.ink, marginBottom: 12, maxWidth: 620 }}>{s.desc}</p>
                    <p style={{ fontSize: 15, lineHeight: 1.75, color: T.muted, maxWidth: 620 }}>{s.details}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {pct === 100 && (
          <div style={{ marginTop: 40, padding: "34px 36px", background: A.accentSoft, borderLeft: `3px solid ${A.accent}` }}>
            <Eyebrow color={A.accentDeep}>Los diez pasos</Eyebrow>
            <h3 style={{ fontSize: 26, fontWeight: 700, marginTop: 14 }}>Completó la lista.</h3>
            <p style={{ marginTop: 12, fontSize: 15.5, lineHeight: 1.65, color: A.accentDeep, maxWidth: 520 }}>
              Si aún no ha tomado el examen, la sección de estudio tiene las 128 preguntas y la simulación de entrevista.
            </p>
            <div style={{ marginTop: 22 }}>
              <PrimaryButton onClick={() => onNav("study")} bg={A.accentDeep} icon={ArrowRight}>Ir al estudio</PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 03 · STUDY ──────────────────────────────────────────────────────────────

function StudyView({ onNav }) {
  const A = PATHS.study;
  const [mode, setMode] = useState("list");
  const [starredOnly, setStarredOnly] = useState(false);
  const [section, setSection] = useState("");
  const [term, setTerm] = useState("");
  const [openQ, setOpenQ] = useState({});
  const [card, setCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const sections = useMemo(() => [...new Set(CIVICS_QUESTIONS.map((q) => q.section))], []);
  const list = useMemo(() => {
    let qs = CIVICS_QUESTIONS;
    if (starredOnly) qs = qs.filter((q) => q.starred);
    if (section) qs = qs.filter((q) => q.section === section);
    if (term) {
      const s = term.toLowerCase();
      qs = qs.filter((q) => q.q_es.toLowerCase().includes(s) || q.q_en.toLowerCase().includes(s)
        || q.answers_es.some((a) => a.toLowerCase().includes(s)) || q.answers_en.some((a) => a.toLowerCase().includes(s)));
    }
    return qs;
  }, [starredOnly, section, term]);

  useEffect(() => { setCard(0); setFlipped(false); }, [starredOnly, section, term]);

  const starCount = CIVICS_QUESTIONS.filter((q) => q.starred).length;

  const AnswerBlock = ({ q, tone = "light" }) => (
    <div style={{ borderTop: `1px solid ${tone === "light" ? T.line : "rgba(255,255,255,.16)"}`, paddingTop: 18 }}>
      <div className="mc-eyebrow" style={{ color: tone === "light" ? A.accent : "rgba(255,255,255,.5)", marginBottom: 14 }}>
        Respuestas aceptadas
      </div>
      {q.answers_en.map((a, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 12, marginBottom: i < q.answers_en.length - 1 ? 13 : 0 }}>
          <span style={{ width: 5, height: 5, background: A.accent, marginTop: 8 }} />
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 600, color: tone === "light" ? T.ink : "#fff", letterSpacing: "-0.01em" }}>{a}</div>
            <div style={{ fontSize: 14.5, color: tone === "light" ? T.muted : "rgba(255,255,255,.55)", marginTop: 2 }}>{q.answers_es[i]}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── FLASHCARD MODE
  if (mode === "cards") {
    const q = list[card] || list[0];
    if (!q) return null;
    return (
      <div style={{ background: T.ink, minHeight: "100vh", color: "#fff" }}>
        <div className="mc-wrap" style={{ paddingTop: 104, paddingBottom: 72, maxWidth: 820 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 34 }}>
            <button className="mc-link" onClick={() => setMode("list")}
              style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,.6)", fontSize: 13, fontWeight: 600, padding: 0 }}>
              <ArrowLeft size={15} strokeWidth={2.4} /> Lista de preguntas
            </button>
            <span className="mc-num" style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>{card + 1} / {list.length}</span>
          </div>

          <div key={q.id} className="mc-stag" style={{ background: T.ink2, border: `1px solid rgba(255,255,255,.12)`, borderTop: `3px solid ${A.accent}`, padding: "42px 40px", minHeight: 380, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
              <span className="mc-num" style={{ fontSize: 12, letterSpacing: ".2em", color: A.accent }}>{String(q.id).padStart(3, "0")}</span>
              {q.starred && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", color: T.gold, border: `1px solid ${T.gold}55`, padding: "3px 9px" }}>
                <Star size={10} fill={T.gold} color={T.gold} /> 65/20</span>}
            </div>
            <h2 style={{ fontSize: "clamp(23px,3.2vw,34px)", fontWeight: 700, lineHeight: 1.16 }}>{q.q_en}</h2>
            <p style={{ marginTop: 14, fontSize: 17, color: "rgba(255,255,255,.58)", lineHeight: 1.45 }}>{q.q_es}</p>

            <div style={{ marginTop: "auto", paddingTop: 32 }}>
              {flipped ? <AnswerBlock q={q} tone="dark" /> : (
                <button className="mc-btn" onClick={() => setFlipped(true)}
                  style={{ width: "100%", padding: 17, border: `1px dashed rgba(255,255,255,.3)`, color: "rgba(255,255,255,.65)", fontSize: 14.5, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
                  <Eye size={16} /> Mostrar respuesta
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <GhostButton onClick={() => { setCard(Math.max(0, card - 1)); setFlipped(false); }} color="rgba(255,255,255,.4)" style={{ flex: 1 }}>Anterior</GhostButton>
            <PrimaryButton onClick={() => { setCard(Math.min(list.length - 1, card + 1)); setFlipped(false); }} bg={A.accent} style={{ flex: 1 }} icon={ArrowRight}>Siguiente</PrimaryButton>
          </div>
          <button className="mc-btn" onClick={() => { setCard(Math.floor(Math.random() * list.length)); setFlipped(false); }}
            style={{ width: "100%", marginTop: 10, padding: 15, border: `1px solid rgba(255,255,255,.16)`, color: "rgba(255,255,255,.62)", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
            <Shuffle size={15} /> Pregunta al azar
          </button>
        </div>
      </div>
    );
  }

  // ── LIST MODE
  return (
    <div style={{ background: T.paper, minHeight: "100vh" }}>
      <PathHero path="study" onNav={onNav} />
      <div className="mc-wrap" style={{ paddingTop: 44, paddingBottom: 96, maxWidth: 1000 }}>

        {/* controls */}
        <div style={{ background: T.card, border: `1px solid ${T.line}`, padding: 20, marginBottom: 28 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 14 }}>
            <PrimaryButton onClick={() => setMode("cards")} bg={A.accent} style={{ padding: "12px 20px", fontSize: 14 }} icon={Layers}>
              Modo tarjetas
            </PrimaryButton>
            <button className="mc-btn" onClick={() => { setStarredOnly(!starredOnly); setSection(""); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 18px", fontSize: 14, fontWeight: 600,
                border: `1px solid ${starredOnly ? T.gold : T.line}`, background: starredOnly ? `${T.gold}18` : "transparent", color: T.ink,
              }}>
              <Star size={14} color={T.gold} fill={starredOnly ? T.gold : "none"} /> 65/20 · {starCount}
            </button>
            <select value={section} onChange={(e) => { setSection(e.target.value); setStarredOnly(false); }}
              style={{ padding: "12px 14px", fontSize: 14, border: `1px solid ${T.line}`, background: T.card, color: T.ink, fontFamily: "inherit", cursor: "pointer" }}>
              <option value="">Todas las secciones</option>
              {sections.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ position: "relative" }}>
            <Search size={16} color={T.faint} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar en preguntas y respuestas"
              style={{ width: "100%", padding: "13px 14px 13px 42px", fontSize: 15, border: `1px solid ${T.line}`, background: T.paper, color: T.ink, fontFamily: "inherit", outline: "none" }} />
          </div>
        </div>

        <div className="mc-eyebrow" style={{ color: T.muted, marginBottom: 14 }}>
          {list.length} {list.length === 1 ? "pregunta" : "preguntas"}
        </div>

        <div style={{ borderTop: `1px solid ${T.line}` }}>
          {list.map((q) => {
            const isOpen = openQ[q.id];
            return (
              <div key={q.id} className="mc-row" style={{ borderBottom: `1px solid ${T.line}`, background: isOpen ? T.card : "transparent" }}>
                <button onClick={() => setOpenQ((p) => ({ ...p, [q.id]: !p[q.id] }))}
                  style={{ width: "100%", display: "flex", gap: 18, padding: "18px 20px", textAlign: "left", alignItems: "flex-start" }}>
                  <span className="mc-num" style={{ fontSize: 11.5, color: T.faint, minWidth: 28, paddingTop: 3 }}>{String(q.id).padStart(3, "0")}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 600, color: T.ink, lineHeight: 1.4, letterSpacing: "-0.01em" }}>{q.q_en}</div>
                    <div style={{ fontSize: 14.5, color: T.muted, marginTop: 4, lineHeight: 1.4 }}>{q.q_es}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0, paddingTop: 2 }}>
                    {q.starred && <Star size={13} color={T.gold} fill={T.gold} />}
                    {isOpen ? <ChevronUp size={16} color={T.faint} /> : <ChevronDown size={16} color={T.faint} />}
                  </div>
                </button>
                {isOpen && <div style={{ padding: "0 20px 24px 66px" }}><AnswerBlock q={q} /></div>}
              </div>
            );
          })}
        </div>

        {list.length === 0 && (
          <div style={{ padding: "56px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Ninguna pregunta coincide con esa búsqueda.</p>
            <p style={{ fontSize: 15, color: T.muted, marginBottom: 22 }}>Pruebe otra palabra, o quite los filtros.</p>
            <GhostButton onClick={() => { setTerm(""); setSection(""); setStarredOnly(false); }} color={T.ink}>Quitar filtros</GhostButton>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 04 · SIMULATION ─────────────────────────────────────────────────────────

function SimulationView({ onNav }) {
  const A = PATHS.simulation;
  const [phase, setPhase] = useState("setup");
  const [count, setCount] = useState(20);
  const [starredOnly, setStarredOnly] = useState(false);
  const [qs, setQs] = useState([]);
  const [i, setI] = useState(0);
  const [marks, setMarks] = useState({});
  const [shown, setShown] = useState(false);

  const start = () => {
    const pool = starredOnly ? CIVICS_QUESTIONS.filter((q) => q.starred) : CIVICS_QUESTIONS;
    setQs([...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length)));
    setI(0); setMarks({}); setShown(false); setPhase("exam");
  };

  const right = Object.values(marks).filter((v) => v === "y").length;
  const wrong = Object.values(marks).filter((v) => v === "n").length;

  // ── SETUP
  if (phase === "setup") {
    return (
      <div style={{ background: T.paper, minHeight: "100vh" }}>
        <PathHero path="simulation" onNav={onNav} />
        <div className="mc-wrap" style={{ paddingTop: 64, paddingBottom: 96, maxWidth: 860 }}>
          <div className="mc-grid-2" style={{ gap: 24, alignItems: "start" }}>

            <div style={{ background: T.card, border: `1px solid ${T.line}`, padding: "34px 32px" }}>
              <Eyebrow color={A.accent}>Configurar</Eyebrow>
              <h2 style={{ fontSize: 27, fontWeight: 700, marginTop: 16, marginBottom: 28 }}>Arme su simulacro</h2>

              <div className="mc-eyebrow" style={{ color: T.muted, marginBottom: 11 }}>Cuántas preguntas</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: T.line, marginBottom: 26 }}>
                {[10, 20, 30, 50].map((n) => (
                  <button key={n} className="mc-btn" onClick={() => setCount(n)}
                    style={{ padding: "16px 0", background: count === n ? A.accent : T.card, color: count === n ? "#fff" : T.ink, fontSize: 16, fontWeight: 700, fontFamily: "'Archivo',sans-serif" }}>
                    {n}
                  </button>
                ))}
              </div>

              <button className="mc-btn" onClick={() => setStarredOnly(!starredOnly)}
                style={{
                  display: "flex", gap: 13, width: "100%", padding: "16px 18px", textAlign: "left", alignItems: "flex-start",
                  border: `1px solid ${starredOnly ? T.gold : T.line}`, background: starredOnly ? `${T.gold}14` : "transparent",
                }}>
                <Star size={17} color={T.gold} fill={starredOnly ? T.gold : "none"} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  <span style={{ display: "block", fontSize: 14.5, fontWeight: 600, color: T.ink }}>Solo las 20 preguntas 65/20</span>
                  <span style={{ display: "block", fontSize: 13.5, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>
                    Para quienes tienen 65 años o más y 20+ como residente permanente
                  </span>
                </span>
              </button>

              <div style={{ marginTop: 28 }}>
                <PrimaryButton onClick={start} bg={A.accent} style={{ width: "100%" }} icon={ArrowRight}>Comenzar simulacro</PrimaryButton>
              </div>
            </div>

            <div style={{ background: A.accentSoft, padding: "34px 32px" }}>
              <Eyebrow color={A.accentDeep}>Cómo será el día</Eyebrow>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginTop: 16, marginBottom: 22, color: A.accentDeep }}>La entrevista real</h3>
              {[
                "El oficial le hace las preguntas en voz alta, en inglés. No hay hoja ni opciones múltiples.",
                "Usted responde en inglés. Basta una de las respuestas aceptadas.",
                "Se detiene al llegar a 12 respuestas correctas. No siempre llega a las 20.",
                "Aquí verá la pregunta en inglés y su traducción. Respóndala en voz alta antes de revelar.",
              ].map((t, k) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 12, paddingBottom: 16 }}>
                  <span className="mc-num" style={{ fontSize: 11, color: A.accent, paddingTop: 3 }}>{String(k + 1).padStart(2, "0")}</span>
                  <p style={{ fontSize: 14.5, lineHeight: 1.65, color: A.accentDeep }}>{t}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS
  if (phase === "result") {
    const need = count <= 20 ? 12 : Math.ceil(qs.length * 0.6);
    const passed = right >= need;
    const pct = Math.round((right / qs.length) * 100);
    return (
      <div style={{ background: T.ink, minHeight: "100vh", color: "#fff" }}>
        <div className="mc-wrap" style={{ paddingTop: 112, paddingBottom: 96, maxWidth: 860 }}>
          <div className="mc-stag">
            <Eyebrow color={passed ? A.accent : "rgba(255,255,255,.5)"}>Resultado del simulacro</Eyebrow>
            <h1 style={{ fontSize: "clamp(38px,7vw,80px)", fontWeight: 800, marginTop: 20 }}>
              {passed ? "Aprobado." : "Todavía no."}
            </h1>
            <p style={{ marginTop: 20, fontSize: 18, lineHeight: 1.6, color: "rgba(255,255,255,.62)", maxWidth: 520 }}>
              {passed
                ? `Acertó ${right} de ${qs.length}. En la entrevista real necesita ${need}.`
                : `Acertó ${right} de ${qs.length}. Necesitaba ${need} para aprobar. Repase las que falló y vuelva a intentarlo.`}
            </p>
          </div>

          <div style={{ marginTop: 52, borderTop: `1px solid rgba(255,255,255,.16)` }}>
            {[["Correctas", right, A.accent], ["Incorrectas", wrong, "rgba(255,255,255,.5)"], ["Sin responder", qs.length - right - wrong, "rgba(255,255,255,.3)"], ["Porcentaje", `${pct}%`, "#fff"]].map(([l, v, c], k) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "20px 0", borderBottom: `1px solid rgba(255,255,255,.1)` }}>
                <span style={{ fontSize: 15.5, color: "rgba(255,255,255,.62)" }}>{l}</span>
                <span className="mc-num" style={{ fontSize: "clamp(26px,4vw,40px)", color: c }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <PrimaryButton onClick={() => setPhase("setup")} bg={A.accent} icon={RotateCcw}>Intentar de nuevo</PrimaryButton>
            <GhostButton onClick={() => onNav("study")} color="rgba(255,255,255,.45)">Repasar las 128</GhostButton>
            <GhostButton onClick={() => onNav("home")} color="rgba(255,255,255,.45)">Inicio</GhostButton>
          </div>
        </div>
      </div>
    );
  }

  // ── EXAM
  const q = qs[i];
  const marked = marks[q.id];
  const finish = () => setPhase("result");
  const next = () => { setShown(false); i < qs.length - 1 ? setI(i + 1) : finish(); };

  return (
    <div style={{ background: T.ink, minHeight: "100vh", color: "#fff" }}>
      <div className="mc-wrap" style={{ paddingTop: 92, paddingBottom: 80, maxWidth: 860 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <button className="mc-link" onClick={() => setPhase("setup")}
            style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,.55)", fontSize: 13, fontWeight: 600, padding: 0 }}>
            <X size={15} strokeWidth={2.4} /> Salir del simulacro
          </button>
          <div style={{ display: "flex", gap: 20 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: A.accent }}>{right} correctas</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.45)" }}>{wrong} falladas</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
          <span className="mc-eyebrow" style={{ color: "rgba(255,255,255,.45)" }}>Pregunta {i + 1} de {qs.length}</span>
          <span className="mc-num" style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>{String(q.id).padStart(3, "0")}</span>
        </div>
        <div style={{ height: 2, background: "rgba(255,255,255,.16)", marginBottom: 34 }}>
          <div style={{ height: 2, background: A.accent, width: `${((i + 1) / qs.length) * 100}%`, transition: "width .4s cubic-bezier(.2,.7,.3,1)" }} />
        </div>

        <div key={q.id} className="mc-stag" style={{ background: T.ink2, border: `1px solid rgba(255,255,255,.12)`, borderTop: `3px solid ${A.accent}`, padding: "38px 36px" }}>
          <div className="mc-eyebrow" style={{ color: A.accent, marginBottom: 14 }}>El oficial pregunta</div>
          <h2 style={{ fontSize: "clamp(23px,3.4vw,36px)", fontWeight: 700, lineHeight: 1.16 }}>{q.q_en}</h2>
          <p style={{ marginTop: 16, paddingLeft: 16, borderLeft: `2px solid rgba(255,255,255,.22)`, fontSize: 16.5, color: "rgba(255,255,255,.58)", lineHeight: 1.5 }}>
            {q.q_es}
          </p>

          <div style={{ marginTop: 32 }}>
            {!shown ? (
              <button className="mc-btn" onClick={() => setShown(true)}
                style={{ width: "100%", padding: 17, border: `1px dashed rgba(255,255,255,.3)`, color: "rgba(255,255,255,.65)", fontSize: 14.5, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
                <Eye size={16} /> Ver respuestas aceptadas
              </button>
            ) : (
              <>
                <div style={{ borderTop: `1px solid rgba(255,255,255,.16)`, paddingTop: 20 }}>
                  <div className="mc-eyebrow" style={{ color: "rgba(255,255,255,.45)", marginBottom: 14 }}>Respuestas aceptadas</div>
                  {q.answers_en.map((a, k) => (
                    <div key={k} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 12, marginBottom: 13 }}>
                      <span style={{ width: 5, height: 5, background: A.accent, marginTop: 8 }} />
                      <div>
                        <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: "-0.01em" }}>{a}</div>
                        <div style={{ fontSize: 14.5, color: "rgba(255,255,255,.55)", marginTop: 2 }}>{q.answers_es[k]}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {!marked && (
                  <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
                    <PrimaryButton onClick={() => setMarks((p) => ({ ...p, [q.id]: "y" }))} bg={A.accent} style={{ flex: 1 }} icon={Check}>Acerté</PrimaryButton>
                    <GhostButton onClick={() => setMarks((p) => ({ ...p, [q.id]: "n" }))} color="rgba(255,255,255,.45)" style={{ flex: 1 }}>Fallé</GhostButton>
                  </div>
                )}
                {marked && (
                  <div style={{ marginTop: 22, padding: "13px 18px", border: `1px solid ${marked === "y" ? A.accent : "rgba(255,255,255,.2)"}`, fontSize: 14, fontWeight: 600, color: marked === "y" ? A.accent : "rgba(255,255,255,.55)" }}>
                    {marked === "y" ? "Marcada como correcta" : "Marcada como fallada"}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <GhostButton onClick={() => { setI(Math.max(0, i - 1)); setShown(false); }} color="rgba(255,255,255,.35)" style={{ flex: 1 }}>Anterior</GhostButton>
          {i < qs.length - 1
            ? <PrimaryButton onClick={next} bg={A.accent} style={{ flex: 1 }} icon={ArrowRight}>Siguiente</PrimaryButton>
            : <PrimaryButton onClick={finish} bg={A.accent} style={{ flex: 1 }} icon={ArrowRight}>Ver resultado</PrimaryButton>}
        </div>
      </div>
    </div>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

function Footer({ onNav }) {
  return (
    <footer style={{ background: T.ink, color: "#fff", borderTop: `1px solid rgba(255,255,255,.1)` }}>
      <div className="mc-wrap" style={{ paddingTop: 64, paddingBottom: 40 }}>
        <div className="mc-grid-2" style={{ gap: 48, alignItems: "start", marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Scale size={18} color={T.gold} strokeWidth={2.2} />
              <span className="mc-display" style={{ fontSize: 17, fontWeight: 700 }}>Mi Ciudadanía</span>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "rgba(255,255,255,.55)", maxWidth: 380 }}>
              Herramienta informativa y educativa gratuita para el proceso de naturalización. No constituye asesoría legal ni establece relación abogado-cliente.
            </p>
          </div>
          <div>
            <div className="mc-eyebrow" style={{ color: "rgba(255,255,255,.4)", marginBottom: 16 }}>Los cuatro caminos</div>
            {PATH_ORDER.map((k) => {
              const p = PATHS[k];
              return (
                <button key={k} onClick={() => onNav(k)} className="mc-link"
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", width: "100%", color: "rgba(255,255,255,.7)", fontSize: 14.5, fontWeight: 500 }}>
                  <span className="mc-num" style={{ fontSize: 11, color: p.accent }}>{p.n}</span>{p.title}
                </button>
              );
            })}
          </div>
        </div>
        <Rule color="rgba(255,255,255,.1)" />
        <div style={{ paddingTop: 26, display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)" }}>
            Creado por <span style={{ color: "#fff", fontWeight: 600 }}>Gustavo Valbuena</span> — Fundador de PeopleBot AI
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>
            Fuente oficial: uscis.gov · USCIS 1-800-375-5283
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [accepted, setAccepted] = useState(false);
  const [view, setView] = useState("home");
  const [wipe, setWipe] = useState(null);

  const navigate = useCallback((to) => {
    if (to === view) return;
    if (to === "home") { setView("home"); window.scrollTo(0, 0); return; }
    setWipe({ to, phase: "in" });
    setTimeout(() => { setView(to); window.scrollTo(0, 0); setWipe({ to, phase: "out" }); }, 620);
    setTimeout(() => setWipe(null), 1220);
  }, [view]);

  if (!accepted) return <DisclaimerGate onAccept={() => setAccepted(true)} />;

  const darkNav = view === "simulation" || view === "home";

  return (
    <div className="mc-root">
      <GlobalStyle />
      {wipe && <ChapterWipe path={wipe.to} phase={wipe.phase} />}
      <Nav view={view} onNav={navigate} dark={darkNav} />
      <main>
        {view === "home" && <Landing onNav={navigate} />}
        {view === "eligibility" && <EligibilityView onNav={navigate} />}
        {view === "process" && <ChecklistView onNav={navigate} />}
        {view === "study" && <StudyView onNav={navigate} />}
        {view === "simulation" && <SimulationView onNav={navigate} />}
      </main>
      <Footer onNav={navigate} />
    </div>
  );
}
