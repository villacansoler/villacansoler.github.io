import os
import yaml

from argparse import ArgumentParser
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape


TEMPLATES_DIR = "templates"


def get_templates():
    env = Environment(
        loader=FileSystemLoader(TEMPLATES_DIR),
        autoescape=select_autoescape()
    )
    return [env.get_template(filename) for filename in os.listdir(TEMPLATES_DIR)]


def get_vars():
    with open("vars.yaml", "r") as fin:
        file_vars = yaml.safe_load(fin)
    return file_vars


def write_file(body: str, filename: str):
    dir = Path(filename)
    with open(dir, 'w') as fout:
        fout.write(body)


def main() -> None:
    templates = get_templates()
    vars = get_vars()

    for template in templates:
        body = template.render(**vars)
        write_file(body, template.name)


def create_parser():
    parser = ArgumentParser("CLI to render Aucanada Book templates")

    return parser


if __name__ == "__main__":
    parser = create_parser()
    args = parser.parse_args()
    main()
