<?php

namespace Phpers\Website;

class MeetupTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @var Meetup $meetup
     */
    private $meetup = [];

    /**
     * @var Meetup $incompleteMeetup
     */
    private $incompleteMeetup = [];
    
    public function setUp()
    {
        $this->meetup = Meetup::fromArray(
            [
                'layout' => 'meetup',
                'categories' => ['wroclaw'],
                'title' => 'PHPers Wrocław #4 / WSG #6',
                'time' => '18:00',
                'facebook' => 'https://www.facebook.com/events/593879660761271/',
                'city' => 'Wrocław',
                'talks' => [
                   [
                       'title' => 'Embrace Events and let CRUD die',
                       'speaker' => 'Kacper Gunia',
                       'description' => 'Od wielu lat aplikacje projektowane są w oparciu o architekturę CRUD i nierzadko trzeba było zapłacić za to wysoką cenę: niemożliwe do rozbudowy monolity, trudny w zrozumieniu kod czy problemy ze skalowaniem. Nawet dziś właśnie ta architektura jest nauczana na uniwersytetach jako polecany sposób budowania systemów IT. W rzeczywistości jednak nie każdy problem może zostać w taki sposób uproszczony i zaimplementowany jako przeglądarka bazy danych czy edytor jej tabel.
Projektowanie złożoemów IT opartych o Event-Driven Architecture nie jest konceptem nowym i zastosowanie tego podejścia do rozwiązania problemów właściwej klasy może znacząco uprościć ich implementację. W trakcie prezentacji prelegent pokaże jak modelować procesy biznesowe z użyciem Event Stormingu oraz jak tłumaczyć te modele na kod z użyciem zasad proponowanych przez Event Sourcing. Nauczysz się w jaki sposób Eventy pomogą Ci wdrożyć Domain-Driven Design, umożliwią projektowanie intuicyjnych interfejsów użytkownika czy sprawią że system będzie łatwy do przetestowania i skalowalny.',
                   ],
                   [
                       'title' => 'Taming Command Bus',
                       'speaker' => 'Krzysztof Mężyk',
                       'description' => 'Command Bus to pojęcie zyskujące coraz więcej uwagi w naszej społeczności. Cóż to takiego? Na pierwszy rzut oka temat ten może wydawać się nieco przytłaczający -- w szczególności próbując poznać wszystkie pojęcia i terminologię. W rzeczywistości Command Bus to bardzo koncept, który ułatwia kompozycję warstwy aplikacji oraz w jasny sposób określa granicę między aplikacją a resztą świata.
W trakcie prezentacek przybliży poszczególne komponenty Command Busa i pokaże jak w prosty sposób można zaimplementować własną "szynę". Prelegent omówi również praktyczne wskazówki, które ułatwią wdrożenie w nowych, jak również spadkowych bazach kodu.',
                   ],
                   [
                       'title' => 'Długo wyczekiwany Drupal 8, już jest!',
                       'speaker' => 'Karol Bryksa',
                       'description' => 'Drupal 8 to najdłużej powstające wydanie CMS Drupal w historii. Wersja ta posiada wiele nowych funkcjonalność (aż 200 w stosunku do Drupal 7), ale też zmiany architektoniczne i implementuje cały szereg komponentów Symfony 2. Czy warto było czekać tak długo z wydaniem? Czego się spodziewać planując projekt w Drupal 8?  Jak zrozumieć Drupal\'a z perspektywy programisty PHP?',
                   ],
                ],
                'venue' => [
                    'location' => '51.1118232,17.0524678',
                    'short' => 'Instytut Informatyki Uniwersytetu Wrocławskiego, sala 25',
                    'description' => 'Tym razem mamy okazję współorganizować PHPers Wrocław #4 razem z Wrocław Symfony Group. A to wszystko pod szyldem drugiej edycji GeekWeekWro!
Po spotkaniu, razem z <a href="https://www.facebook.com/clearcode/" target="_blank">ClearCode</a>, zapraszamy was na after party do <a href="https://www.facebook.com/Cybermachina/" target="_blank">CyberMachiny</a>, na naszą tradycyjną pizzę i piwo.
Spotykamy się w środę, 13 kwietnia o godzinie 18.00 w <a href="http://ii.uni.wroc.pl" target="_blank">Instytucie Informatyki UWr</a>.',
                ],
                'sponsors' => [
                    [
                        'name' => 'ClearCode',
                        'site' => 'http://clearcode.cc',
                        'logo' => '/img/sponsor/clearcode.png',
                    ],
                    [
                        'name' => 'HELION',
                        'site' => 'http://helion.pl',
                        'logo' => '/img/sponsor/logo_helion.jpeg',
                    ]
                ],
            ]
        );

        $this->incompleteMeetup = Meetup::fromArray(
            [
                'layout' => 'meetup',
                'categories' => ['wroclaw'],
                'title' => 'PHPers Kraków #4',
                'time' => '18:30',
                'facebook' => 'https://www.facebook.com/events/593879660761271/',
                'city' => 'Kraków',
                'talks' => [
                    [
                        'title' => 'TBD',
                    ],
                    [
                        'title' => '',
                        'speaker' => '',
                        'description' => '',
                    ],
                ],
                'venue' => [
                    'location' => '51.1118232,17.0524678',
                    'short' => 'Instytut Informatyki Uniwersytetu Wrocławskiego, sala 25',
                    'description' => 'Tym razem mamy okazję współorganizować PHPers Wrocław #4 razem z Wrocław Symfony Group. A to wszystko pod szyldem drugiej edycji GeekWeekWro!
Po spotkaniu, razem z <a href="https://www.facebook.com/clearcode/" target="_blank">ClearCode</a>, zapraszamy was na after party do <a href="https://www.facebook.com/Cybermachina/" target="_blank">CyberMachiny</a>, na naszą tradycyjną pizzę i piwo.
Spotykamy się w środę, 13 kwietnia o godzinie 18.00 w <a href="http://ii.uni.wroc.pl" target="_blank">Instytucie Informatyki UWr</a>.',
                ],
                'sponsors' => [
                    [
                        'name' => 'ClearCode',
                        'site' => 'http://clearcode.cc',
                    ],
                    [
                        'name' => 'HELION',
                        'site' => 'http://helion.pl',
                        'logo' => '/img/sponsor/logo_helion.jpeg',
                    ]
                ],
            ]
        );
    }

    /**
     * @test
     */
    public function it_convert_sponsors_from_array_into_value_obects()
    {
        $sponsors = $this->meetup->sponsors();
      
        $this->assertSame(2, count($sponsors));
        $this->assertInstanceOf(Sponsor::class, $sponsors[0]);
        $this->assertInstanceOf(Sponsor::class, $sponsors[1]);

        $sponsors = $this->incompleteMeetup->sponsors();

        $this->assertSame(2, count($sponsors));
        $this->assertInstanceOf(Sponsor::class, $sponsors[0]);
        $this->assertSame('', $sponsors[0]->logoUrl());
        $this->assertSame('/img/sponsor/logo_helion.jpeg', $sponsors[1]->logoUrl());
    }
    
    /**
     * @test
     */
    public function it_convert_talk_speakers_from_array_into_value_objects()
    {
        $speakers = $this->meetup->speakers();

        $this->assertSame(3, count($speakers));
        $this->assertInstanceOf(Speaker::class, $speakers[0]);
        $this->assertInstanceOf(Speaker::class, $speakers[1]);
        $this->assertInstanceOf(Speaker::class, $speakers[2]);

        $speakers = $this->incompleteMeetup->speakers();

        $this->assertSame(1, count($speakers));
        $this->assertInstanceOf(Speaker::class, $speakers[0]);
        $this->assertSame('', (string) $speakers[0]);
    }
    
    /**
     * @test
     */
    public function it_convert_talk_from_array_into_value_objects()
    {
        $talks = $this->meetup->talks();

        $this->assertSame(3, count($talks));
        $this->assertInstanceOf(Talk::class, $talks[0]);
        $this->assertInstanceOf(Talk::class, $talks[1]);
        $this->assertInstanceOf(Talk::class, $talks[2]);
    }
    
    /**
     * @test
     */
    public function it_convert_city_from_array_into_value_object()
    {
        $this->assertSame('Wrocław', (string) $this->meetup->city());
        $this->assertEquals('51.1118232', $this->meetup->city()->latitude());
        $this->assertEquals('17.0524678', $this->meetup->city()->longitude());
    }
}
