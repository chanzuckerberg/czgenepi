import setuptools

description = "ASPEN.  Covid Tracking 2.0"

setuptools.setup(
    name="aspen",
    version="0.1.0",
    author=", ".join(["Aspen Team"]),
    author_email=", ".join(["<info@chanzuckerberg.com"]),
    description=description,
    long_description=description,
    packages=setuptools.find_packages(),
    python_requires=">=3.7",
    entry_points={
        "console_scripts": [
            "aspen-cli = aspen.cli.toplevel:cli",
        ]
    },
    include_package_data=True,
    install_requires=[],
)
