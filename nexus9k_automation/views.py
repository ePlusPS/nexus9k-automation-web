import csv
import os
from django.conf import settings
from django.shortcuts import render


def main(request):
    nexus_config = list(csv.reader(open(os.path.join(settings.PROJECT_ROOT, 'nexus_config.csv'))))

    return render(request, 'main.html', { "nexus_config": nexus_config })
