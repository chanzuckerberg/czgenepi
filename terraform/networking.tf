data "aws_availability_zones" "available" {}

resource "aws_default_vpc" "default" {}

data "aws_internet_gateway" "default" {
  filter {
    name   = "attachment.vpc-id"
    values = [aws_default_vpc.default.id]
  }
}


resource "aws_default_route_table" "default" {
  default_route_table_id = aws_default_vpc.default.default_route_table_id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = data.aws_internet_gateway.default.id
  }
}


resource "aws_default_subnet" "default" {
  count = length(split(",", join(",", flatten(data.aws_availability_zones.available.*.names))))
  availability_zone = data.aws_availability_zones.available.names[count.index]
}
