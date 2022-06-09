from collections import namedtuple

Point = namedtuple(
    "Point", ["region", "country", "division", "location", "latitude", "longitude"]
)
# If you use any of this location data for real places, that's your fault.
TEST_COUNTRY_DATA = [
    Point(
        "North America", "Canada", None, None, 61.06669235229492, -107.99170684814453
    ),
    Point(
        "North America",
        "Canada",
        "British Columbia",
        None,
        61.06669235229492,
        -107.99170684814453,
    ),
    Point(
        "North America",
        "Canada",
        "British Columbia",
        "Vancouver",
        61.06669235229492,
        -107.99170684814453,
    ),
    Point("North America", "Panama", None, None, 8.983329772949219, -79.5166015625),
    Point("North America", "Panama", "Panama", None, 8.983329772949219, -79.5166015625),
    Point(
        "North America",
        "Panama",
        "Panama",
        "Panama City",
        8.983329772949219,
        -79.5166015625,
    ),
    Point("North America", "Cuba", None, None, 23.013134002685547, -80.83287811279297),
    Point(
        "North America",
        "Cuba",
        "La Habana",
        None,
        23.013134002685547,
        -80.83287811279297,
    ),
    Point(
        "North America",
        "Cuba",
        "La Habana",
        "Havana",
        23.013134002685547,
        -80.83287811279297,
    ),
    Point(
        "North America", "Honduras", None, None, 15.257243156433105, -86.07551574707031
    ),
    Point(
        "North America",
        "Honduras",
        "Francisco Morazán",
        None,
        15.257243156433105,
        -86.07551574707031,
    ),
    Point(
        "North America",
        "Honduras",
        "Francisco Morazán",
        "Tegucigalpa",
        15.257243156433105,
        -86.07551574707031,
    ),
    Point(
        "North America", "Bahamas", None, None, 24.77365493774414, -78.00005340576172
    ),
    Point(
        "North America",
        "Bahamas",
        "New Providence",
        None,
        24.77365493774414,
        -78.00005340576172,
    ),
    Point(
        "North America",
        "Bahamas",
        "New Providence",
        "Nassau",
        24.77365493774414,
        -78.00005340576172,
    ),
    Point(
        "North America", "Jamaica", None, None, 18.109600067138672, -77.29750061035156
    ),
    Point(
        "North America",
        "Jamaica",
        "Surrey",
        None,
        18.109600067138672,
        -77.29750061035156,
    ),
    Point(
        "North America",
        "Jamaica",
        "Surrey",
        "Kingston",
        18.109600067138672,
        -77.29750061035156,
    ),
    Point(
        "North America", "Bermuda", None, None, 32.301822662353516, -64.76036071777344
    ),
    Point(
        "North America",
        "Bermuda",
        "Pembroke",
        None,
        32.301822662353516,
        -64.76036071777344,
    ),
    Point(
        "North America",
        "Bermuda",
        "Pembroke",
        "Hamilton",
        32.301822662353516,
        -64.76036071777344,
    ),
    Point("South America", "Aruba", None, None, 12.501362800598145, -69.96184539794922),
    Point(
        "South America",
        "Aruba",
        "Oranjestad",
        None,
        12.501362800598145,
        -69.96184539794922,
    ),
    Point(
        "South America",
        "Aruba",
        "Oranjestad",
        "Oranjestad",
        12.501362800598145,
        -69.96184539794922,
    ),
    Point("North America", "Haiti", None, None, 19.139995574951172, -72.35709381103516),
    Point(
        "North America", "Haiti", "Ouest", None, 19.139995574951172, -72.35709381103516
    ),
    Point(
        "North America",
        "Haiti",
        "Ouest",
        "Port-au-Prince",
        19.139995574951172,
        -72.35709381103516,
    ),
    Point(
        "North America", "Belize", None, None, 16.825979232788086, -88.76009368896484
    ),
    Point(
        "North America",
        "Belize",
        "Belize",
        None,
        16.825979232788086,
        -88.76009368896484,
    ),
    Point(
        "North America",
        "Belize",
        "Belize",
        "Belize City",
        16.825979232788086,
        -88.76009368896484,
    ),
    Point(
        "North America", "Guatemala", None, None, 15.635608673095703, -89.89881134033203
    ),
    Point(
        "North America",
        "Guatemala",
        "Guatemala",
        None,
        15.635608673095703,
        -89.89881134033203,
    ),
    Point(
        "North America",
        "Guatemala",
        "Guatemala",
        "Guatemala City",
        15.635608673095703,
        -89.89881134033203,
    ),
    Point("North America", "USA", None, None, 38.916961669921875, -98.89137268066406),
    Point("North America", "USA", "Nevada", None, 36.3467726, -115.0907378),
    Point("North America", "USA", "Nevada", "Clark County", 36.3467726, -115.0907378),
    Point("North America", "USA", "California", None, 37.6017, -121.7195),
    Point("North America", "USA", "California", "Alameda County", 37.6017, -121.7195),
    Point("North America", "Mexico", None, None, 19.43252944946289, -99.13320922851562),
    Point(
        "North America",
        "Mexico",
        "Jalisco",
        None,
        19.43252944946289,
        -99.13320922851562,
    ),
    Point(
        "North America",
        "Mexico",
        "Jalisco",
        "Guadalajara",
        19.43252944946289,
        -99.13320922851562,
    ),
    Point(
        "North America",
        "El Salvador",
        None,
        None,
        13.80003833770752,
        -88.91407012939453,
    ),
    Point(
        "North America",
        "El Salvador",
        "San Salvador",
        None,
        13.80003833770752,
        -88.91407012939453,
    ),
    Point(
        "North America",
        "El Salvador",
        "San Salvador",
        "San Salvador",
        13.80003833770752,
        -88.91407012939453,
    ),
    Point(
        "North America",
        "Dominican Republic",
        None,
        None,
        19.097402572631836,
        -70.30280303955078,
    ),
    Point(
        "North America",
        "Dominican Republic",
        "National District",
        None,
        19.097402572631836,
        -70.30280303955078,
    ),
    Point(
        "North America",
        "Dominican Republic",
        "National District",
        "Santo Domingo",
        19.097402572631836,
        -70.30280303955078,
    ),
    Point(
        "North America", "Costa Rica", None, None, 10.0378999710083, -83.81875610351562
    ),
    Point(
        "North America",
        "Costa Rica",
        "San José",
        None,
        10.0378999710083,
        -83.81875610351562,
    ),
    Point(
        "North America",
        "Costa Rica",
        "San José",
        "San José",
        10.0378999710083,
        -83.81875610351562,
    ),
    Point("Asia", "Japan", None, None, 35.685359954833984, 139.7530975341797),
    Point("Asia", "Japan", "Kantō", None, 35.685359954833984, 139.7530975341797),
    Point("Asia", "Japan", "Kantō", "Tokyo", 35.685359954833984, 139.7530975341797),
    Point("Asia", "China", None, None, 25.043279, 121.565717),
    Point("Asia", "China", "Shanghai", None, 25.043279, 121.565717),
    Point("Asia", "China", "Shanghai", "Shanghai", 25.043279, 121.565717),
    Point("Europe", "France", None, None, 46.22760009765625, 2.21370005607605),
    Point(
        "Europe", "France", "Île-de-France", None, 46.22760009765625, 2.21370005607605
    ),
    Point(
        "Europe",
        "France",
        "Île-de-France",
        "Paris",
        46.22760009765625,
        2.21370005607605,
    ),
    Point("Europe", "Germany", None, None, 51.16569900512695, 10.451499938964844),
    Point("Europe", "Germany", "Berlin", None, 51.16569900512695, 10.451499938964844),
    Point(
        "Europe", "Germany", "Berlin", "Berlin", 51.16569900512695, 10.451499938964844
    ),
]
