<?php

namespace Phpers\Website;

class SponsorTest extends \PHPUnit_Framework_TestCase
{
    private $sponsor;

    public function setUp()
    {
        $this->sponsor = new Sponsor(
            'Cocoders',
            '/images/sponsor/cocoders.jpg',
            'http://cocoders.com'
        );
    }

    /**
     * @test
     */
    public function it_allows_to_get_sponsor_info()
    {
        $this->assertSame('Cocoders', $this->sponsor->name());
        $this->assertSame('http://cocoders.com', $this->sponsor->websiteUrl());
        $this->assertSame('/images/sponsor/cocoders.jpg', $this->sponsor->logoUrl());
    }
}
