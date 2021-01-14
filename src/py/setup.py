from pathlib import Path

import setuptools

description = "COVIDR.  Covid Tracking 2.0"

# NOTE: this is not compatible with a sdist installation of covidr.
requirements_file = Path(__file__).parent / "requirements.txt"
with requirements_file.open("r") as fh:
    requirement_lines = fh.readlines()

setuptools.setup(
    name="covidr",
    version="0.0.0",
    author=", ".join(
        [
            "Shannon Axelrod",
            "Phoenix Logan",
            "Lucia Reynoso",
            "Tony Tung",
        ]
    ),
    author_email=", ".join(
        [
            "shannon.axelrod@chanzuckerberg.com",
            "phoenix.logan@czbiohub.org",
            "lreynoso@chanzuckerberg.com",
            "ttung@chanzuckerberg.com",
        ]
    ),
    description=description,
    long_description=description,
    packages=setuptools.find_packages(),
    python_requires=">=3.7",
    entry_points={
        "console_scripts": [
            "covidr-cli = covidr.cli.toplevel:cli",
        ]
    },
    include_package_data=True,
    install_requires=requirement_lines,
)
