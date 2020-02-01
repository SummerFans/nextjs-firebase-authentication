// https://stripe.com/docs/payments/checkout/one-time#create-one-time-payments

import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Button, message } from 'antd';

import useErrorIndicator from '@hooks/useErrorIndicator';

export const STRIPE_CREATE_ORDER = gql`
  mutation StripeCreateOrder(
    $imageUrl: String!
    $courseId: String!
    $bundleId: String!
    $coupon: String
  ) {
    stripeCreateOrder(
      imageUrl: $imageUrl
      courseId: $courseId
      bundleId: $bundleId
      coupon: $coupon
    ) {
      id
    }
  }
`;

export type StripeCheckoutProps = {
  imageUrl: string;
  courseId: string;
  bundleId: string;
  coupon: string;
};

const StripeCheckout = ({
  imageUrl,
  courseId,
  bundleId,
  coupon,
}: StripeCheckoutProps) => {
  const [stripeCreateOrder, { loading, error }] = useMutation(
    STRIPE_CREATE_ORDER
  );

  useErrorIndicator({
    error,
  });

  const handlePay = async () => {
    let result;

    try {
      result = await stripeCreateOrder({
        variables: {
          imageUrl,
          courseId,
          bundleId,
          coupon,
        },
      });
    } catch (error) {}

    if (result) {
      const stripeResult = await (window as any)
        .Stripe(process.env.STRIPE_CLIENT_ID)
        .redirectToCheckout({
          sessionId: result.data.stripeCreateOrder.id,
        });

      stripeResult.error &&
        message.error({
          content: stripeResult.error.message,
          duration: 2,
        });
    }
  };

  return (
    <Button
      type="primary"
      aria-label="stripe-checkout"
      loading={loading}
      onClick={handlePay}
    >
      Credit Card
    </Button>
  );
};

export default StripeCheckout;