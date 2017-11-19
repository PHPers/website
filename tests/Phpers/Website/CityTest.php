<?php

namespace Phpers\Website;

class CityTest extends \PHPUnit_Framework_TestCase
{
    private $city;

    public function setUp()
    {
        $this->city = new City('Trójmiasto');
    }

    /**
     * @test
     */
    public function it_allows_to_get_city_name()
    {
        $this->assertSame('Trójmiasto', (string) $this->city);
    }
    
    /**
     * @test
     * @dataProvider nameProvider
     */
    public function it_allows_to_get_normalized_name($name, $normalizedName)
    {
        $city = new City($name);
        $this->assertSame($normalizedName, $city->normalizedName());
    }

    public function nameProvider()
    {
        return [
            ['Trójmiasto', 'trojmiasto'],
            ['Śląsk', 'slask'],
            ['Rzeszów', 'rzeszow']
        ];
    }
}
