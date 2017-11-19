<?php

namespace Phpers\Website;

class SpeakerTest extends \PHPUnit_Framework_TestCase
{
    private $speaker;

    public function setUp()
    {
        $this->speaker = new Speaker(
            'Leszek Prabucki'
        );
    }

    /**
     * @test
     */
    public function it_allows_to_get_speaker_name()
    {
        $this->assertSame('Leszek Prabucki', (string) $this->speaker);
    }
}
