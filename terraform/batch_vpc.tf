data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "mccloud" {
  cidr_block           = "10.20.0.0/16"
  enable_dns_hostnames = true
  tags = merge(local.common_tags, {
    Name = "mccloud-${var.DEPLOYMENT_ENVIRONMENT}"
  })
}

resource "aws_internet_gateway" "mccloud" {
  vpc_id = aws_vpc.mccloud.id
  tags = merge(local.common_tags, {
    Name = "mccloud-${var.DEPLOYMENT_ENVIRONMENT}"
  })
}

resource "aws_route" "mccloud" {
  route_table_id         = aws_vpc.mccloud.default_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.mccloud.id
}

resource "aws_subnet" "mccloud" {
  for_each                = toset(data.aws_availability_zones.available.names)
  vpc_id                  = aws_vpc.mccloud.id
  availability_zone       = each.key
  cidr_block              = cidrsubnet(aws_vpc.mccloud.cidr_block, 8, index(data.aws_availability_zones.available.names, each.key))
  map_public_ip_on_launch = true
  tags = merge(local.common_tags, {
    Name = "mccloud-${var.DEPLOYMENT_ENVIRONMENT}"
  })
}

resource "aws_security_group" "mccloud" {
  name   = "mccloud-${var.DEPLOYMENT_ENVIRONMENT}"
  vpc_id = aws_vpc.mccloud.id
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
