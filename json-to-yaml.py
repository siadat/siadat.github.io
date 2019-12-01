import sys
import json
import yaml

data = "\n".join(sys.stdin.readlines())
print yaml.dump(yaml.load(json.dumps(json.loads(data))), default_flow_style=False)
