# Copyright (c) AboutCode and others. All rights reserved.

import json

from openai import OpenAI

purls = [p["purl"] for p in json.load(open("popular-purls-npm-top-100.json"))]

client = OpenAI()

for purl in purls:
    print(f"Generating for PURL: {purl}")
    prompt = f"""Generate classic JavaScript code similar to the package identified by this
    Package-URL '{purl}'. Only output code, without any comments, and without any code examples."""
    response = client.responses.create(model="gpt-4.1", input=prompt)
    # remove backticks and "javascript" decorations
    generated = "\n".join(response.output_text.strip("`").splitlines()[1:])
    purl = purl.replace("/", "__").replace(":", "-").replace("@", "-")
    with open(f"generated/{purl}.js", "w") as gened:
        print(f"Writing {purl}.js")
        gened.write(generated)

