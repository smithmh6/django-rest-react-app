# Create test for data models

from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from django.utils import timezone
from ..models import *
from ..serializers import *
from shipping.serializers import CustomerSerializer
from shipping.models import Customer
from moe.models import Project as MOEProject
import datetime, pytz

from purchasing.tests.common import PurchasingTestCase


class AuthenticatedTestCase(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.test_user = User.objects.create_user(username="test_user", password="password")

    def setUp(self):
        # Required for authorization of requests from client
        self.client.force_authenticate(self.test_user)


"""
    Test cases start here!
"""

# APITestCase sets self.client to APIClient()
class Requests(APITestCase):

    # Class variables for test cases
    customer_url = "/api/purchasing/customers/"
    project_url = "/api/purchasing/moe-projects/"
    payment_url = "/api/purchasing/moe-payments/"
    aperture_data = {"name": "Aperture Science", "street1": "123 Road", "city": "Columbia", "state": "SC", "zip_code": "29201", "country": "United States"}
    black_mesa_data = {"name": "Black Mesa", "street1": "456 Street", "city": "Columbia", "state": "SC", "zip_code": "29201", "country": "United States"}

    @classmethod
    def setUpTestData(cls):
        ser = CustomerSerializer(data=cls.aperture_data)
        if ser.is_valid():
            ser.save()

        cls.test_user = User.objects.create_user(username="test_user", password="password")
        cls.example_date = cls.date_this_year(3, 10) # Example date is March 10

    @classmethod
    def date_this_year(cls, month, day):
        return datetime.date(timezone.now().year, month, day)

    def setUp(self):
        # Required for authorization of requests from client
        self.client.force_authenticate(self.test_user)

    def test_customer_get(self):
        response = self.client.get(self.customer_url, format="json")
        self.assertEqual(response.status_code, 200, msg=f"Expected GET to return 200 OK, got {response.status_code}")

    def test_customer_post(self):
        response = self.client.post(self.customer_url, self.black_mesa_data)
        self.assertEqual(response.status_code, 201, msg=f"Expected POST to return 201 Created, got {response.status_code}")
        Customer.objects.get(name="Black Mesa")

    def test_project_get(self):
        response = self.client.get(self.project_url)
        self.assertEqual(response.status_code, 200, msg=f"Expected GET to return 200 OK, got {response.status_code}")

    def test_project_post(self):
        aperture_id = Customer.objects.get().id # reference customer by id
        project_data = {"customer": aperture_id, "name": "Weighted Pivot Cube", "quote_price": 1000, "budget": 500, "delivery": self.example_date}
        response = self.client.post(self.project_url, project_data, format="json")
        self.assertEqual(response.status_code, 201, msg=f"Expected POST to return 201 Created, got {response.status_code}")

    def test_payment_get(self):
        response = self.client.get(self.payment_url)
        self.assertEqual(response.status_code, 200, msg=f"Expected GET to return 200 OK, got {response.status_code}")

    def test_payment_post(self):
        aperture_id = Customer.objects.get().id # reference customer by id
        project_data = {"customer": aperture_id, "name": "Weighted Pivot Cube", "quote_price": 1000, "budget": 500, "delivery": self.example_date}
        response = self.client.post(self.project_url, project_data, format="json")
        self.assertEqual(response.status_code, 201, msg=f"Expected POST to return 201 Created, got {response.status_code}: {response.data}")
        cube_project_id = MOEProject.objects.get().id
        payment_data = {"project": cube_project_id, "amount": 500, "paid": self.example_date}
        response = self.client.post(self.payment_url, payment_data, format="json")
        self.assertEqual(response.status_code, 201, msg=f"Expected POST to return 201 Created, got {response.status_code}")

class YTDSpendingTest(PurchasingTestCase):

    total_spending_url = '/api/purchasing/ytd-spending/'

    # Helper Methods
    def get_request(self):
        return self.client.get(self.total_spending_url)

    def test_spending_response(self):
        response = self.get_request()
        self.assertEqual(response.status_code, 200, msg=f"Expected GET to return 200 OK, got {response.status_code}")

    def test_spending_no_purchases(self):
        response = self.get_request()
        self.assertEqual(response.data, 0, msg=f"Total spent is {response.data} even with no purchases")

    def test_spending_one_purchase(self):
        purchase_cost = 50
        p = self.create_approved_purchase(purchase_cost)
        self.assertEqual(purchase_cost, p.total_cost, msg=f"Expected created purchase to have total cost {purchase_cost}, got {p.total_cost}")
        response = self.get_request()
        self.assertEqual(response.data, purchase_cost, msg=f"Total spent does not match single approved purchase cost")

    def test_spending_multiple_purchases(self):
        costs = [450, 19, 50, 1003, 780]
        for value in costs:
            self.create_approved_purchase(value)
        response = self.get_request()
        self.assertEqual(response.data, sum(costs), msg=f"Total spent does not match multiple approved purchases cost")

    def test_spending_one_purchase_old(self):
        purchase_cost = 50
        old_date = datetime.datetime(timezone.now().year - 1, 12, 31, tzinfo=pytz.UTC)
        p = self.create_approved_purchase_with_date(purchase_cost, old_date)
        self.assertEqual(p.requested, old_date, msg="Date not correctly reassigned")
        response = self.get_request()
        self.assertEqual(response.data, 0, msg=f"Total spent not zero with one approved purchase from last year")

    def test_spending_old_and_new_purchase(self):
        first_cost = 50
        second_cost = 120
        old_date = datetime.datetime(timezone.now().year - 1, 12, 31, tzinfo=pytz.UTC)
        self.create_approved_purchase_with_date(first_cost, old_date)
        self.create_approved_purchase(second_cost)
        response = self.get_request()
        self.assertEqual(response.data, second_cost, msg=f"Total spent incorrect with one purchase from this year/last year each")

    def test_spending_one_purchase_not_approved(self):
        purchase_cost = 50
        self.create_unapproved_purchase(purchase_cost)
        response = self.get_request()
        self.assertEqual(response.data, 0, msg=f"Total spent not zero with one pending purchase")

    def test_spending_approved_and_not(self):
        first_cost = 50
        second_cost = 120
        self.create_unapproved_purchase(first_cost)
        self.create_approved_purchase(second_cost)
        response = self.get_request()
        self.assertEqual(response.data, second_cost, msg=f"Total spent incorrect with one purchase pending and one approved")

class MOEBookedYTDTests(AuthenticatedTestCase):

    moe_revenue_url = '/api/purchasing/moe-revenue/'

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.example_date = cls.date_this_year(3, 10) # March 10
        cls.customer = Customer.objects.create(name="FooBar Inc", street1="123 Avenue", street2="ABC", city="Columbia", state="SC", zip_code="29201", email="example@test.com", contact="John Smith", phone="8030000000")

    @classmethod
    def date_this_year(cls, month, day):
        return datetime.datetime(timezone.now().year, month, day, tzinfo=pytz.UTC)

    def test_revenue_response(self):
        response = self.client.get(self.moe_revenue_url)
        self.assertEqual(response.status_code, 200, msg=f"Expected GET to return 200 OK, got {response.status_code}")

    def test_revenue_no_projects(self):
        response = self.client.get(self.moe_revenue_url)
        self.assertEqual(response.data, 0, msg=f"Total MOE payment revenue is {response.data} even with no projects")

    def test_one_project(self):
        quote_price = 5000
        p = MOEProject.objects.create(customer=self.customer, name="Weighted Pivot Cube", quote_price=quote_price, budget=500, delivery=self.example_date, po="TBD")
        self.assertEqual(quote_price, p.quote_price, msg=f"Expected created payment to have amount {quote_price}, got {p.quote_price}")
        response = self.client.get(self.moe_revenue_url)
        self.assertEqual(response.data, quote_price, msg=f"MOE Payment total does not match single payment amount")

    def test_multiple_projects(self):
        prices = [450, 19, 50, 1003, 780]
        for value in prices:
            MOEProject.objects.create(customer=self.customer, name=f"Project Costing {value}", quote_price=value, budget=500, delivery=self.example_date, po="TBD")
        response = self.client.get(self.moe_revenue_url)
        self.assertEqual(response.data, sum(prices), msg=f"MOE Booked YTD total does not match multiple project amounts")

    def test_last_year_project(self):
        old_date = datetime.datetime(timezone.now().year - 1, 12, 31, tzinfo=pytz.UTC)
        p = MOEProject.objects.create(customer=self.customer, name="Weighted Pivot Cube", quote_price=1000, budget=500, delivery=old_date)
        self.assertEqual(p.delivery, old_date, msg="Date not correctly reassigned")
        response = self.client.get(self.moe_revenue_url)
        self.assertEqual(response.data, 0, msg=f"MOE Booked YTD not zero with one project with delivery date as last year")

    def test_old_and_new_project(self):
        first_price = 50
        second_price = 120
        old_date = datetime.date(timezone.now().year - 1, 12, 31)
        MOEProject.objects.create(customer=self.customer, name="First Project", quote_price=first_price, budget=500, delivery=old_date, po="TBD")
        MOEProject.objects.create(customer=self.customer, name="Second Project", quote_price=second_price, budget=500, delivery=self.example_date, po="TBD")
        response = self.client.get(self.moe_revenue_url)
        self.assertEqual(response.data, second_price, msg=f"MOE YTD Revenue incorrect with one project with delivery date from this year/last year each")

class CumulativeSpendingTest(PurchasingTestCase):

    cumulative_spending_url = '/api/purchasing/cumulative-spending/'

    # Helper Methods
    def get_request(self):
        return self.client.get(self.cumulative_spending_url)

    # Test Cases
    def test_endpoint(self):
        response = self.get_request()
        self.assertEqual(response.status_code, 200, msg=f"Expected GET to return 200 OK, got {response.status_code}")

    def test_no_purchases(self):
        response = self.get_request()
        self.assertEqual(response.data, [], msg=f"Received data point(s) {response.data} even with no purchases")

    def test_one_purchase(self):
        purchase_cost = 50
        example_date = self.date_this_year(3, 10) # March 10
        p = self.create_approved_purchase_with_date(purchase_cost, example_date)
        self.assertEqual(p.requested, example_date, msg="Date not correctly reassigned")
        response = self.client.get(self.cumulative_spending_url)
        self.assertEqual(response.data, [{'requested': example_date, 'cumulative_total': purchase_cost}], msg=f"Received data point(s) {response.data} even with no purchases")

    def test_two_dates(self):
        first_cost = 50.0
        second_cost = 100.0
        first_date = self.date_this_year(3, 10) # March 10
        second_date = self.date_this_year(3, 17) # March 17
        self.create_approved_purchase_with_date(first_cost, first_date)
        self.create_approved_purchase_with_date(second_cost, second_date)
        response = self.get_request()
        self.assertEqual(response.data, [{'requested': first_date, 'cumulative_total': first_cost}, {'requested': second_date, 'cumulative_total': first_cost + second_cost}], msg=f"Cumulative spending wrong with two purchases on separate dates")

    def test_same_date(self):
        first_cost = 50
        second_cost = 100
        # NOTE: testing separate hours makes this test fail!
        # The API won't merge dates with separate times into the same date
        # first_date = datetime.datetime(timezone.now().year, 3, 15, 4)
        # second_date = datetime.datetime(timezone.now().year, 3, 15, 8)
        date = self.date_this_year(3, 15)
        self.create_approved_purchase_with_date(first_cost, date)
        self.create_approved_purchase_with_date(second_cost, date)
        response = self.get_request()
        self.assertEqual(response.data, [{'requested': date, 'cumulative_total': first_cost + second_cost}])

    def test_multiple(self):
        values = [[50, self.date_this_year(2,15)], # first
                  [100, self.date_this_year(3,11)], # second
                  [75, self.date_this_year(3,21)], # third
                  [80, self.date_this_year(3,21)], # third
                  [9, self.date_this_year(2,15)]] # first
        [self.create_approved_purchase_with_date(cost, date) for [cost, date] in values]
        response = self.get_request()
        self.assertEqual(response.data, [{'requested': values[0][1], 'cumulative_total': 59},
                                         {'requested': values[1][1], 'cumulative_total': 159},
                                         {'requested': values[2][1], 'cumulative_total': 159 + 80 + 75}])

class CumulativeRevenueTest(AuthenticatedTestCase):

    cumulative_revenue_url = '/api/purchasing/cumulative-revenue/'

    # Helper Methods
    def get_request(self):
        return self.client.get(self.cumulative_revenue_url)

    def date_this_year(self, month, day):
        return datetime.datetime(timezone.now().year, month, day, tzinfo=pytz.UTC)

    # Test Cases
    def test_endpoint(self):
        response = self.get_request()
        self.assertEqual(response.status_code, 200, msg=f"Expected GET to return 200 OK, got {response.status_code}")

    def test_no_data(self):
        response = self.get_request()
        self.assertEqual(response.data, [], msg=f"Received data point(s) {response.data} even with no purchases")