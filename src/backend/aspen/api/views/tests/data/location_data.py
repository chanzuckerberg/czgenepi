from collections import namedtuple

Point = namedtuple("Point", ["region", "country", "latitude", "longitude"])
TEST_COUNTRY_DATA = [
    Point("North America", "Canada", 61.06669235229492, -107.99170684814453),
    Point("North America", "Panama", 8.983329772949219, -79.5166015625),
    Point("North America", "Cuba", 23.013134002685547, -80.83287811279297),
    Point("North America", "Honduras", 15.257243156433105, -86.07551574707031),
    Point("North America", "Bahamas", 24.77365493774414, -78.00005340576172),
    Point("North America", "Jamaica", 18.109600067138672, -77.29750061035156),
    Point("North America", "Bermuda", 32.301822662353516, -64.76036071777344),
    Point("South America", "Aruba", 12.501362800598145, -69.96184539794922),
    Point("North America", "Haiti", 19.139995574951172, -72.35709381103516),
    Point("North America", "Belize", 16.825979232788086, -88.76009368896484),
    Point("North America", "Guatemala", 15.635608673095703, -89.89881134033203),
    Point("North America", "USA", 38.916961669921875, -98.89137268066406),
    Point("North America", "Mexico", 19.43252944946289, -99.13320922851562),
    Point("North America", "El Salvador", 13.80003833770752, -88.91407012939453),
    Point(
        "North America", "Dominican Republic", 19.097402572631836, -70.30280303955078
    ),
    Point("North America", "Costa Rica", 10.0378999710083, -83.81875610351562),
    Point("Asia", "Japan", 35.685359954833984, 139.7530975341797),
    Point("Asia", "China", 33.39433288574219, 104.6898422241211),
    Point("Europe", "France", 46.22760009765625, 2.21370005607605),
    Point("Europe", "Germany", 51.16569900512695, 10.451499938964844),
]
