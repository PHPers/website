<?php

namespace Phpers\Website;

class TalkTest extends \PHPUnit_Framework_TestCase
{
    private $talk;

    public function setUp()
    {
        $this->talk = new Talk(
            'Embrace Events and let CRUD die',
            'Od wielu lat aplikacje projektowane są w oparciu o architekturę CRUD i nierzadko trzeba było zapłacić za to wysoką cenę: niemożliwe do rozbudowy monolity, trudny w zrozumieniu kod czy problemy ze skalowaniem.'
        );
    }

    /**
     * @test
     */
    public function it_allows_to_get_sponsor_info()
    {
        $this->assertSame('Embrace Events and let CRUD die', $this->talk->title());
        $this->assertSame(
            'Od wielu lat aplikacje projektowane są w oparciu o architekturę CRUD i nierzadko trzeba było zapłacić za to wysoką cenę: niemożliwe do rozbudowy monolity, trudny w zrozumieniu kod czy problemy ze skalowaniem.',
            $this->talk->description()
        );
    }
}
