# Admin Panel Documentation

This document provides an overview and usage instructions for the administration panel of the Pavel Fišer website.

## Table of Contents

1.  [Overview](#1-overview)
2.  [Accessing the Admin Panel](#2-accessing-the-admin-panel)
3.  [Dashboard](#3-dashboard)
4.  [Article Management](#4-article-management)
    *   [Viewing Articles](#41-viewing-articles)
    *   [Creating New Articles](#42-creating-new-articles)
    *   [Editing Articles](#43-editing-articles)
    *   [Deleting Articles](#44-deleting-articles)
    *   [Publishing and Drafts](#45-publishing-and-drafts)
5.  [Category Management](#5-category-management)
    *   [Viewing Categories](#51-viewing-categories)
    *   [Creating/Editing Categories](#52-creatingediting-categories)
    *   [Deleting Categories](#53-deleting-categories)
6.  [Newsletter Management](#6-newsletter-management)
    *   [Subscribers](#61-subscribers)
    *   [Campaigns](#62-campaigns)
    *   [Templates](#63-templates)
7.  [Analytics](#7-analytics)
8.  [Settings](#8-settings)
9.  [Troubleshooting](#9-troubleshooting)

---

1. Přehled
Administrační panel je centralizovaný redakční systém (CMS) navržený tak, aby Pavel Fišer a pověření uživatelé mohli spravovat obsah webu, včetně článků, kategorií, odběratelů newsletteru, kampaní a šablon.

2. Přístup do administrace
Administrační panel je dostupný na adrese /admin na webu. Při přístupu budete vyzváni k přihlášení.

Přihlašovací údaje:

Uživatelské jméno: admin (nebo podle nastavení v environment proměnných)
Heslo: Nastaveno v proměnné ADMIN_PAVEL_PASSWORD.
Důležité: Uchovávejte své přihlašovací údaje v bezpečí. Nesdílejte je veřejně.

3. Dashboard
Po úspěšném přihlášení budete přesměrováni na Dashboard. Tato sekce poskytuje rychlý přehled klíčových metrik a posledních aktivit, například:

Celkový počet článků
Počet publikovaných článků
Poslední komentáře (pokud jsou implementovány)
Počet odběratelů newsletteru
Rychlé odkazy na běžné úkoly (např. „Nový článek“, „Zobrazit analytiku“)
4. Správa článků
Tato sekce umožňuje vytvářet, upravovat, publikovat a spravovat všechny články na webu.

4.1. Zobrazení článků
Přejděte na záložku „Články“. Zobrazí se tabulka se všemi články.

Vyhledávání: Použijte vyhledávací pole pro hledání článků podle názvu, obsahu nebo štítků.
Filtrovat podle kategorie: Filtrovat lze podle přiřazené kategorie.
Filtrovat podle stavu: Filtrovat lze podle „Publikováno“, „Koncept“ nebo „Archivováno“.
Stránkování: Pomocí tlačítek „Předchozí“ a „Další“ můžete přecházet mezi stránkami článků.
4.2. Vytvoření nového článku
Klikněte na tlačítko „Nový článek“. Budete přesměrováni do editoru článku. Vyplňte následující pole:

Název článku: Hlavní název článku.
URL Slug: Automaticky generovaná adresa z názvu, lze upravit pro SEO.
Úryvek: Krátké shrnutí článku, používá se pro náhledy.
Obsah článku: Hlavní text článku. Použijte editor Tiptap pro formátování.
Kategorie: Vyberte existující kategorii.
URL obrázku: Odkaz na hlavní obrázek.
Stav: Nastavte na „Koncept“, „Publikováno“ nebo „Archivováno“.
Datum publikace: Volitelně naplánujte datum publikace.
Doporučený článek: Označte, pokud má být článek zvýrazněn.
Meta titulek: Pro SEO, zobrazuje se ve výsledcích vyhledávání.
Meta popis: Pro SEO, popis ve výsledcích vyhledávání.
Klikněte na „Vytvořit koncept“ pro uložení jako koncept, nebo „Publikovat“ pro okamžité zveřejnění.

4.3. Úprava článků
V seznamu článků klikněte na „Upravit“ vedle požadovaného článku. Editor se načte s existujícím obsahem. Proveďte změny a klikněte na „Uložit změny“.

4.4. Mazání článků
V seznamu článků klikněte na „Smazat“ vedle článku. Zobrazí se potvrzovací dialog. Potvrzením článek trvale smažete. Tato akce je nevratná.

4.5. Publikace a koncepty
Koncepty: Články uložené jako „Koncept“ nejsou veřejně viditelné.
Publikováno: Články se stavem „Publikováno“ jsou zveřejněné na webu.
Naplánováno: Články s budoucím datem publikace se automaticky zveřejní v daný čas.
5. Správa kategorií
Tato sekce umožňuje organizovat články do kategorií.

5.1. Zobrazení kategorií
Přejděte na záložku „Kategorie“. Zobrazí se seznam všech kategorií a počet článků v každé z nich.

5.2. Vytvoření/úprava kategorií
Klikněte na „Nová kategorie“ pro vytvoření nové, nebo „Upravit“ vedle existující.

Název: Název kategorie (např. „Aktuality“, „Doprava“).
Popis: Volitelný popis kategorie.
Klikněte na „Vytvořit“ nebo „Uložit změny“ pro uložení.

5.3. Mazání kategorií
Klikněte na „Smazat“ vedle kategorie. Potvrďte smazání. Články, které byly v této kategorii, budou mít kategorii nastavenou na NULL.

6. Správa newsletteru
Spravujte odběratele newsletteru, vytvářejte a rozesílejte kampaně, spravujte e-mailové šablony.

6.1. Odběratelé
Přejděte na záložku „Odběratelé“.

Zobrazte seznam všech odběratelů, datum přihlášení, zdroj a stav (aktivní/odhlášen).
Můžete ručně odhlásit uživatele.
Export CSV: Stáhněte si CSV soubor se všemi odběrateli.
6.2. Kampaně
Přejděte na záložku „Kampaně“.

Nová kampaň: Vytvořte novou e-mailovou kampaň.
Předmět e-mailu: Předmět newsletteru.
Obsah e-mailu: Tělo newsletteru, podpora HTML.
Lze vybrat jednotlivé aktivní odběratele nebo všechny aktivní.
Klikněte na „Odeslat kampaň“ pro rozeslání.
Historie kampaní: Seznam všech odeslaných kampaní, včetně předmětu, data odeslání a základních statistik (počet příjemců, otevření, prokliky).
6.3. Šablony
Přejděte na záložku „Šablony“.

Vytvářejte a spravujte znovupoužitelné e-mailové šablony pro kampaně.
7. Analytika
Přejděte na záložku „Analytika“.

Zobrazte základní statistiky návštěvnosti webu, např. počet zobrazení stránek a návštěvníků.
(Poznámka: Pokročilé metriky a denní trendy mohou vyžadovat další integraci.)
8. Nastavení
Přejděte na záložku „Nastavení“.

Obecná nastavení: Nastavte název webu, popis, kontaktní e-mail a ID integrací (Google Analytics, Facebook Page ID).
Nastavení administrátora: Zobrazte uživatelské jméno administrátora. Změnu hesla lze provést zde (ponechte prázdné pro zachování současného).
Povolit newsletter: Zapněte/vypněte newsletter pro veřejný web.
Nezapomeňte po změnách kliknout na „Uložit nastavení“.

9. Řešení problémů
Problémy s přihlášením: Zkontrolujte zadané uživatelské jméno a heslo. Ujistěte se, že proměnná ADMIN_PAVEL_PASSWORD je správně nastavena na vaší produkční platformě (např. Vercel).
Data se nenačítají: Zkontrolujte konzoli prohlížeče pro případné chyby. Ověřte, že vaše Neon PostgreSQL databáze běží a že DATABASE_URL je správně nastavená.
Chyby API: Pokud narazíte na chyby při ukládání nebo načítání dat, zkontrolujte serverové logy na Vercelu pro podrobnější informace.
Grafické chyby: Zkuste vymazat cache prohlížeče nebo provést tvrdé obnovení stránky.

